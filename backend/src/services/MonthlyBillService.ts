/**
 * OpenAccounting
 * Copyright (C) 2024 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import html_to_pdf, { Options } from 'html-pdf-node';
import PDFMerger from 'pdf-merger-js';

import { DateTime, Injectable } from "acts-util-node";
import { LanguageService } from "./LanguageService";
import { AccountingMonthService } from "./AccountingMonthService";
import { Item, ItemsController } from "../data-access/ItemsController";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { Payment, PaymentLink, PaymentLinkReason, PaymentsController } from "../data-access/PaymentsController";
import { Money } from '@dintero/money';
import { Product, ProductsController } from '../data-access/ProductsController';
import { AssetController } from '../data-access/AssetController';
import { NumberDictionary } from 'acts-util-core';
import { SubscriptionsController } from '../data-access/SubscriptionsController';

interface MonthlyBillData
{
    expenses: {item: Item; payments: Payment[]; }[];
    movements: { payment: Payment, links: PaymentLink[], linkedPayments: Payment[] }[];
    products: { item: Item; payments: Payment[]; product: Product; }[];
    subscriptions: { item: Item; payments: Payment[]; }[];
    transactionFeeSum: Money;
}

type TableColumnFormat = "accountingMonth" | "identity" | "paymentService" | "subscription";
type TableValue = DateTime | Money | number | string | number[] | DateTime[];
interface TableColumnDefinition<T>
{
    selector: (row: T) => TableValue;
    title: string;
    type?: TableColumnFormat;
}

@Injectable
export class MonthlyBillService
{
    constructor(private languageService: LanguageService, private accountingMonthService: AccountingMonthService, private itemsController: ItemsController, private identitiesController: IdentitiesController,
        private paymentsController: PaymentsController, private productsController: ProductsController, private assetController: AssetController, private subscriptionsController: SubscriptionsController)
    {
    }

    //Public methods
    public async GenerateMonthlyBillPDF(year: number, month: number)
    {
        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const data = await this.CollectData(year, month);

        const pages = [
            { content: await this.GenerateTitlePage(year, month, data), landscape: false },
            { content: await this.GenerateSubscriptionsPage(data), landscape: true },
            { content: await this.GenerateProductSalesPage(data), landscape: true },
            { content: await this.GenerateManualSalesPage(range.inclusiveStart, range.inclusiveEnd), landscape: true },
            { content: await this.GenerateExpensesPage(data), landscape: true },
            { content: await this.GenerateMovementsPage(data), landscape: true },
        ];
        const pdfPages = await pages.Values().Map(x => this.HTMLToPDF(x.content, x.landscape)).PromiseAll();
        return this.MergePDFs(pdfPages);
    }

    //Private methods
    private async CollectData(year: number, month: number): Promise<MonthlyBillData>
    {
        const currency = await this.languageService.GetNativeCurrency();

        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const payments = await this.paymentsController.QueryPaymentsInRange(range.inclusiveStart, range.inclusiveEnd);

        let transactionFeeSum = Money.of("0", currency);
        const expenses = [];
        const movements = [];
        const products = [];
        const subscriptions = [];
        for (const payment of payments)
        {
            const itemIds = await this.paymentsController.QueryAssociatedItems(payment.id);
            const links = await this.paymentsController.QueryPaymentLinks(payment.id, "outgoing");

            const isPaymentBooked = (itemIds.length > 0) || (links.length > 0);

            if(isPaymentBooked)
                transactionFeeSum = transactionFeeSum.add(Money.of(payment.transactionFee, payment.currency));

            for (const itemId of itemIds)
            {
                const item = await this.itemsController.QueryItem(itemId);
                if(item === undefined)
                    throw new Error("should never happen");

                const paymentIds = await this.itemsController.QueryPaymentIdsAssociatedWithItem(item.id);
                const payments = await paymentIds.Values().Map(id => this.paymentsController.QueryPayment(id)).Async().NotUndefined().ToArray();

                if(item.amount.startsWith("-"))
                    expenses.push({ item, payments });
                else if(item.subscriptionId !== null)
                    subscriptions.push({ item, payments });
                else if(item.productId !== null)
                {
                    const product = await this.productsController.QueryProduct(item.productId);
                    if(product === undefined)
                        throw new Error("should never happen");
                    products.push({ item, payments, product });
                }
            }

            if(links.length > 0)
            {
                movements.push({
                    payment,
                    links,
                    linkedPayments: await links.Values().Map(x => this.paymentsController.QueryPayment(x.paymentId)).Async().NotUndefined().ToArray()
                });
            }
        }

        return {
            expenses,
            transactionFeeSum,
            movements,
            products,
            subscriptions
        };
    }

    private async GenerateExpensesPage(data: MonthlyBillData)
    {
        return this.GenerateTablePage("Ausgaben", [
            {
                selector: e => e.item.timestamp,
                title: "Datum",
            },
            {
                selector: e => e.item.subscriptionId!,
                title: "Posten",
                type: "subscription"
            },
            {
                selector: p => p.item.debtorId,
                title: "Kreditor",
                type: "identity"
            },
            {
                selector: p => Money.of(p.item.amount, p.item.currency),
                title: "Betrag"
            },
            {
                selector: p => p.payments.map(x => x.timestamp),
                title: "Zahlungsdatum",
            },
            {
                selector: p => p.payments.map(x => x.paymentServiceId),
                title: "Zahlungsmittel",
                type: "paymentService"
            },
            {
                selector: p => p.payments.map(x => x.externalTransactionId).join("\n"),
                title: "Transaktionscode",
            },
        ], data.expenses);
    }

    private async GenerateManualSalesPage(inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const currency = await this.languageService.GetNativeCurrency();
        const zone = await this.languageService.GetBookingTimeZone();

        const items = await this.itemsController.QueryItemsInRange(inclusiveStart, inclusiveEnd);
        const rows = [];
        let sum = Money.of("0", currency);
        for (const item of items)
        {
            if(item.productId !== null)
                continue;
            if(item.subscriptionId !== null)
                continue;
            const identity = await this.identitiesController.QueryIdentity(item.debtorId);
            if(identity === undefined)
                throw new Error("should never happen");

            const paymentIds = await this.itemsController.QueryPaymentIdsAssociatedWithItem(item.id);
            const payments = await paymentIds.Values().Map(id => this.paymentsController.QueryPayment(id)).Async().NotUndefined().ToArray();
            const paymentServices = await payments.Values().Map(p => this.paymentsController.QueryService(p.paymentServiceId)).PromiseAll();

            rows.push(`
            <tr>
                <td>${item.timestamp.ToZone(zone).ToISOString()}</td>
                <td>${item.note}</td>
                <td>${identity.lastName + ", " + identity.firstName}</td>
                <td>${item.amount + " " + item.currency}</td>
                <td>${paymentServices.map(x => x.name)}</td>
                <td>${payments.map(x => x.externalTransactionId).join("\n")}</td>
            </tr>
            `);
            sum = sum.add(Money.of(item.amount, item.currency));
        }

        return `
        <h3>Sonstige Einnahmen</h3>
        <table class="borders">
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Posten</th>
                    <th>Debitor</th>
                    <th>Betrag</th>
                    <th>Zahlungsmittel</th>
                    <th>Transaktionscode</th>
                </tr>
                ${rows.join("")}
            </thead>
            <tbody>
                <tr>
                    <td colspan="6"></td>
                </tr>
                <tr>
                    <td colspan="3">Summe:</td>
                    <td>${sum.toString() + " " + currency}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
        `;
    }

    private GenerateMovementsPage(data: MonthlyBillData)
    {
        function ReasonToString(links: PaymentLink[])
        {
            if(links.Values().Distinct(x => x.reason).Count() != 1)
                throw new Error("NOT IMPLEMENTED");
            switch(links[0].reason)
            {
                case PaymentLinkReason.CashDeposit:
                    return "Bareinlage";
                case PaymentLinkReason.PrivateDisbursement:
                    return "Ausgleich Privatauslage";
            }
        }
        function IsCashDeposit(links: PaymentLink[])
        {
            if(links.Values().Distinct(x => x.reason).Count() != 1)
                throw new Error("NOT IMPLEMENTED");
            return links[0].reason === PaymentLinkReason.CashDeposit;
        }
        function PaymentServiceOf(linkedPayments: Payment[])
        {
            if(linkedPayments.Values().Distinct(x => x.paymentServiceId).Count() != 1)
                throw new Error("NOT IMPLEMENTED");
            return linkedPayments[0].paymentServiceId;
        }

        return this.GenerateTablePage("Monetäre Bewegungen", [
            {
                selector: m => m.payment.timestamp,
                title: "Datum"
            },
            {
                selector: m => ReasonToString(m.links),
                title: "Beschreibung"
            },
            {
                selector: m => IsCashDeposit(m.links) ? m.payment.senderId : m.payment.receiverId,
                title: "Person",
                type: "identity"
            },
            {
                selector: m => Money.of(m.payment.grossAmount, m.payment.currency),
                title: "Betrag"
            },
            {
                selector: m => IsCashDeposit(m.links) ? PaymentServiceOf(m.linkedPayments) : m.payment.paymentServiceId,
                title: "Zahlungsquelle",
                type: "paymentService"
            },
            {
                selector: m => IsCashDeposit(m.links) ? m.payment.paymentServiceId : PaymentServiceOf(m.linkedPayments),
                title: "Zahlungsziel",
                type: "paymentService"
            },
            {
                selector: m => m.payment.externalTransactionId,
                title: "Transaktionscode",
            },
            {
                selector: m => m.linkedPayments.map(x => x.externalTransactionId).join(", "),
                title: "zugehörige Transaktion"
            }
        ], data.movements, false);
    }

    private async GenerateProductSalesPage(data: MonthlyBillData)
    {
        return this.GenerateTablePage("Verkäufe", [
            {
                selector: p => p.item.timestamp,
                title: "Fälligkeitsdatum",
            },
            {
                selector: p => p.product.title,
                title: "Posten",
            },
            {
                selector: p => p.item.debtorId,
                title: "Debitor",
                type: "identity"
            },
            {
                selector: p => Money.of(p.item.amount, p.item.currency),
                title: "Betrag"
            },
            {
                selector: p => p.payments.map(x => x.timestamp),
                title: "Zahlungsdatum",
            },
            {
                selector: p => p.payments.map(x => x.paymentServiceId),
                title: "Zahlungsmittel",
                type: "paymentService"
            },
            {
                selector: p => p.payments.map(x => x.externalTransactionId).join("\n"),
                title: "Transaktionscode",
            },
        ], data.products);
    }

    private async GenerateSubscriptionsPage(data: MonthlyBillData)
    {
        return this.GenerateTablePage("Abonnements", [
            {
                selector: s => s.item.timestamp,
                title: "Beitragsmonat",
                type: "accountingMonth"
            },
            {
                selector: s => s.item.debtorId,
                title: "Mitglied",
                type: "identity"
            },
            {
                selector: s => s.item.subscriptionId!,
                title: "Posten",
                type: "subscription"
            },
            {
                selector: s => Money.of(s.item.amount, s.item.currency),
                title: "Betrag",
            },
            {
                selector: s => s.payments.map(x => x.paymentServiceId),
                title: "Zahlungsmittel",
                type: "paymentService"
            },
            {
                selector: m => m.payments.map(x => x.externalTransactionId).join("\n"),
                title: "Transaktionscode",
            },
        ], data.subscriptions);
    }

    private async GenerateTablePage<T>(title: string, columns: TableColumnDefinition<T>[], rows: T[], addSum?: boolean)
    {
        const zone = await this.languageService.GetBookingTimeZone();
        
        const htmlRows: string[] = [];
        const sums: NumberDictionary<Money> = {};

        for (const row of rows)
        {
            const cells: string[] = [];
            for (const col of columns)
            {
                const value = col.selector(row);
                cells.push(await this.ValueToString(value, zone, col.type));
                if(value instanceof Money)
                {
                    const index = cells.length - 1;
                    if(index in sums)
                        sums[index] = sums[index]!.add(value);
                    else
                        sums[index] = value;
                }
                
            }
            htmlRows.push("<tr>" + cells.map(x => "<td>" + x + "</td>").join("") + "</tr>");
        }

        let lastIndex = 0;
        const sumCols: string[] = [];
        for (const kv of sums.Entries().OrderBy(kv => parseInt(kv.key.toString())))
        {
            if(sumCols.length === 0)
                sumCols.push(`<td colspan="${kv.key - lastIndex}">Summe:</td>`);
            else
                sumCols.push(`<td colspan="${kv.key - lastIndex}">${this.RenderMonetaryValue(kv.value!)}</td>`);
            lastIndex = parseInt(kv.key.toString());
        }
        if((lastIndex > 0) && (lastIndex < (columns.length - 1)))
        {
            const last = sums[lastIndex];
            sumCols.push(`<td colspan="${columns.length - lastIndex}">${this.RenderMonetaryValue(last!)}</td>`)
        }

        let sumRow = "";
        if(addSum ?? true)
        {
            sumRow = `
            <tr>
                    <td colspan="${columns.length}"></td>
            </tr>
            <tr>
                ${sumCols.join("")}
            </tr>
            `;
        }

        return `
        <h3>${title}</h3>
        <table class="borders">
            <thead>
                <tr>
                    ${columns.map(x => "<th>" + x.title + "</th>").join("")}
                </tr>
            </thead>
            <tbody>
                ${htmlRows.join("")}
                ${sumRow}
            </tbody>
        </table>
        `;
    }

    private async GenerateTitlePage(year: number, month: number, data: MonthlyBillData)
    {
        const companyName = await this.assetController.QueryAsset("name");
        const date = new Date(year, month - 1);
        const lang = await this.languageService.GetBCP47Tag();
        const monthName = date.toLocaleString(lang, { month: 'long' });

        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const currency = await this.languageService.GetNativeCurrency();

        const items = await this.itemsController.QueryItemsInRange(range.inclusiveStart, range.inclusiveEnd);

        let expenses = Money.of("0", currency);
        for (const entry of data.expenses)
            expenses = expenses.add(Money.of(entry.item.amount, entry.item.currency));

        let manualSalesSum = Money.of("0", currency);
        for (const item of items)
        {
            if((item.subscriptionId === null) && (item.productId === null))
                manualSalesSum = manualSalesSum.add(Money.of(item.amount, item.currency));
        }

        let productsSum = Money.of("0", currency);
        for (const product of data.products)
        {
            const item = product.item;
            productsSum = productsSum.add(Money.of(item.amount, item.currency));
        }

        let subscriptionsSum = Money.of("0", currency);
        for (const subscription of data.subscriptions)
        {
            const item = subscription.item;
            subscriptionsSum = subscriptionsSum.add(Money.of(item.amount, item.currency));
        }

        const salesVolume = productsSum.add(subscriptionsSum);
        const totalEarnings = salesVolume.add(manualSalesSum);
        const balance = totalEarnings.add(expenses).add(data.transactionFeeSum);

        return `
        <h2>${companyName} - Monatsabrechnung</h2>
        <h3>${monthName} ${year}</h3>
        <table class="sums">
            <tbody>
                <tr>
                    <th>Summe Abonnements:</th>
                    <td>${subscriptionsSum.toString() + " " + currency}</td>
                </tr>
                <tr>
                    <th>Summe Verkäufe:</th>
                    <td>${productsSum.toString() + " " + currency}</td>
                </tr>
                <tr>
                    <th>Umsatz:</th>
                    <td>${salesVolume.toString() + " " + currency}</td>
                </tr>
                <tr>
                    <th>Sonstige Einnahmen:</th>
                    <td>${manualSalesSum.toString() + " " + currency}</td>
                </tr>
                <tr>
                    <th>Summe Einnahmen:</th>
                    <td>${totalEarnings.toString() + " " + currency}</td>
                </tr>
                <tr>
                    <td colspan="2"><br /></td>
                </tr>
                <tr>
                    <th>Ausgaben:</th>
                    <td>${this.RenderMonetaryValue(expenses)}</td>
                </tr>
                <tr>
                    <th>Transaktionsgebühren:</th>
                    <td>${this.RenderMonetaryValue(data.transactionFeeSum)}</td>
                </tr>
                <tr>
                <td colspan="2"><br /></td>
                </tr>
                <tr>
                    <th>Saldo:</th>
                    <td>${balance.toString() + " " + currency}</td>
                </tr>
            </tbody>
        </table>
        <p>Ich bestätige die Abrechnung nach bestem Wissen und Gewissen erstellt zu haben.</p>
        <p>
        ______________________
        Unterschrift Ersteller
        </p>
        <p>
        ______________________
        Unterschrift Kassenwart
        </p>
        `;
    }
    private RenderMonetaryValue(money: Money)
    {
        const value = money.toString() + " " + money.currency();
        if(money.isNegative())
            return `<span class="negative">${value}</span>`;
        return value;
    }

    private HTMLToPDF(body: string, landscape: boolean)
    {
        const file = { content: this.WrapHTMLBody(body) };
        const options: Options = {
            format: 'A4',
            landscape,
            margin: {
                bottom: "1cm",
                left: "1cm",
                right: "1cm",
                top: "1cm",
            }
        };

        return new Promise<Buffer>( (resolve, reject) => {
            html_to_pdf.generatePdf(file, options, (error, pdfBuffer) => {
                if(error)
                    reject(error);
                else
                    resolve(pdfBuffer);
            });
        });
    }

    private async MergePDFs(pdfs: Buffer[])
    {
        var merger = new PDFMerger();

        await pdfs.Values().Map(async pdf => await merger.add(pdf)).PromiseAll();

        return await merger.saveAsBuffer();
    }

    private async ValueToString(value: TableValue, zone: string, format?: TableColumnFormat): Promise<string>
    {
        if(Array.isArray(value))
        {
            const values = await (value as any[]).Values().Map(x => this.ValueToString(x, zone, format)).PromiseAll();
            return values.join("\n");
        }
        else if(value instanceof DateTime)
        {
            if(format === "accountingMonth")
                return value.ToZone(zone).Format("MMMM YYYY");
            else
                return value.ToZone(zone).ToLocalizedString("de");
        }
        else if(value instanceof Money)
        {
            return this.RenderMonetaryValue(value);
        }
        else if(typeof value === "number")
        {
            switch(format)
            {
                case "identity":
                    const identity = await this.identitiesController.QueryIdentity(value);
                    if(identity === undefined)
                        throw new Error("should never happen");
                    return identity.lastName + ", " + identity.firstName;
                case "paymentService":
                    const paymentService = await this.paymentsController.QueryService(value);
                    return paymentService.name;
                case "subscription":
                    const subscription = await this.subscriptionsController.QuerySubscription(value);
                    if(subscription === undefined)
                        throw new Error("should never happen");
                    return subscription.name;
                default:
                    throw new Error("Type required for column");
            }
        }
        else
            return value;
    }

    private WrapHTMLBody(body: string)
    {
        return `
        <!doctype html>
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <style>
                h2, h3
                {
                    text-align: center;
                }

                span.negative
                {
                    color: red;
                }

                table.borders
                {
                    width: 100%;
                }

                table.borders, table.borders th, table.borders td
                {
                    border: 1px solid black;
                    border-collapse: collapse;
                }

                table.sums th
                {
                    text-align: left;
                }

                table.sums td
                {
                    text-align: right;
                }
                </style>
            </head>
            <body>
            ${body}
            </body>
        </html>
        `;
    }
}