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
import { ItemsController } from "../data-access/ItemsController";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { PaymentsController } from "../data-access/PaymentsController";
import { Money } from '@dintero/money';
import { ProductsController } from '../data-access/ProductsController';
import { AssetController } from '../data-access/AssetController';

interface MonthlyBillData
{
    transactionFeeSum: Money;
}

@Injectable
export class MonthlyBillService
{
    constructor(private languageService: LanguageService, private accountingMonthService: AccountingMonthService, private itemsController: ItemsController, private identitiesController: IdentitiesController,
        private paymentsController: PaymentsController, private productsController: ProductsController, private assetController: AssetController)
    {
    }

    //Public methods
    public async GenerateMonthlyBillPDF(year: number, month: number)
    {
        const range = await this.accountingMonthService.CalculateUTCRangeOfAccountingMonth(year, month);
        const data = await this.CollectData(year, month);

        const pages = [
            { content: await this.GenerateTitlePage(year, month, data), landscape: false },
            { content: await this.GenerateSubscriptionsPage(range.inclusiveStart, range.inclusiveEnd), landscape: true },
            { content: await this.GenerateProductSalesPage(range.inclusiveStart, range.inclusiveEnd), landscape: true },
            { content: await this.GenerateManualSalesPage(range.inclusiveStart, range.inclusiveEnd), landscape: true },
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
        for (const payment of payments)
        {
            const itemIds = await this.paymentsController.QueryAssociatedItems(payment.id);
            const links = await this.paymentsController.QueryPaymentLinks(payment.id, "outgoing");
            if((itemIds.length > 0) || (links.length > 0))
                transactionFeeSum = transactionFeeSum.add(Money.of(payment.transactionFee, payment.currency));
        }

        return {
            transactionFeeSum
        };
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

    private async GenerateProductSalesPage(inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const currency = await this.languageService.GetNativeCurrency();
        const zone = await this.languageService.GetBookingTimeZone();

        const items = await this.itemsController.QueryItemsInRange(inclusiveStart, inclusiveEnd);
        const rows = [];
        let sum = Money.of("0", currency);
        for (const item of items)
        {
            if(item.productId === null)
                continue;
            const identity = await this.identitiesController.QueryIdentity(item.debtorId);
            if(identity === undefined)
                throw new Error("should never happen");
            const product = await this.productsController.QueryProduct(item.productId);
            if(product === undefined)
                throw new Error("should never happen");

            const paymentIds = await this.itemsController.QueryPaymentIdsAssociatedWithItem(item.id);
            const payments = await paymentIds.Values().Map(id => this.paymentsController.QueryPayment(id)).Async().NotUndefined().ToArray();
            const paymentServices = await payments.Values().Map(p => this.paymentsController.QueryService(p.paymentServiceId)).PromiseAll();

            rows.push(`
            <tr>
                <td>${item.timestamp.ToZone(zone).ToLocalizedString("de")}</td>
                <td>${product.title}</td>
                <td>${identity.lastName + ", " + identity.firstName}</td>
                <td>${item.amount + " " + item.currency}</td>
                <td>1</td>
                <td>${item.amount + " " + item.currency}</td>
                <td>${paymentServices.map(x => x.name)}</td>
                <td>${payments.map(x => x.externalTransactionId).join("\n")}</td>
            </tr>
            `);
            sum = sum.add(Money.of(item.amount, item.currency));
        }

        return `
        <h3>Verkäufe</h3>
        <table class="borders">
            <thead>
                <tr>
                    <th>Datum</th>
                    <th>Posten</th>
                    <th>Debitor</th>
                    <th>Stückkosten</th>
                    <th>Stückzahl</th>
                    <th>Summe</th>
                    <th>Zahlungsmittel</th>
                    <th>Transaktionscode</th>
                </tr>
                ${rows.join("")}
            </thead>
            <tbody>
                <tr>
                    <td colspan="8"></td>
                </tr>
                <tr>
                    <td colspan="5">Summe:</td>
                    <td>${sum.toString() + " " + currency}</td>
                    <td colspan="2"></td>
                </tr>
            </tbody>
        </table>
        `;
    }

    private async GenerateSubscriptionsPage(inclusiveStart: DateTime, inclusiveEnd: DateTime)
    {
        const currency = await this.languageService.GetNativeCurrency();
        const zone = await this.languageService.GetBookingTimeZone();

        const items = await this.itemsController.QueryItemsInRange(inclusiveStart, inclusiveEnd);
        const rows = [];
        let sum = Money.of("0", currency);
        for (const item of items)
        {
            if(item.subscriptionId === null)
                continue;
            const identity = await this.identitiesController.QueryIdentity(item.debtorId);
            if(identity === undefined)
                throw new Error("should never happen");
            const paymentIds = await this.itemsController.QueryPaymentIdsAssociatedWithItem(item.id);
            const payments = await paymentIds.Values().Map(id => this.paymentsController.QueryPayment(id)).Async().NotUndefined().ToArray();
            const paymentServices = await payments.Values().Map(p => this.paymentsController.QueryService(p.paymentServiceId)).PromiseAll();

            rows.push(`
            <tr>
                <td>${item.timestamp.ToZone(zone).Format("MMMM YYYY")}</td>
                <td>${identity.lastName + ", " + identity.firstName}</td>
                <td>${item.amount + " " + item.currency}</td>
                <td>${paymentServices.map(x => x.name)}</td>
                <td>${payments.map(x => x.externalTransactionId).join("\n")}</td>
            </tr>
            `);
            sum = sum.add(Money.of(item.amount, item.currency));
        }

        return `
        <h3>Abonnements</h3>
        <table class="borders">
            <thead>
                <tr>
                    <th>Beitragsmonat</th>
                    <th>Mitglied</th>
                    <th>Betrag</th>
                    <th>Zahlungsmittel</th>
                    <th>Transaktionscode</th>
                </tr>
                ${rows.join("")}
            </thead>
            <tbody>
                <tr>
                    <td colspan="5"></td>
                </tr>
                <tr>
                    <td colspan="2">Summe:</td>
                    <td>${sum.toString() + " " + currency}</td>
                    <td colspan="2"></td>
                </tr>
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
        let manualSalesSum = Money.of("0", currency);
        let productsSum = Money.of("0", currency);
        let subscriptionsSum = Money.of("0", currency);
        for (const item of items)
        {
            if(item.productId !== null)
                productsSum = productsSum.add(Money.of(item.amount, item.currency));
            else if(item.subscriptionId !== null)
                subscriptionsSum = subscriptionsSum.add(Money.of(item.amount, item.currency));
            else
                manualSalesSum = manualSalesSum.add(Money.of(item.amount, item.currency));

            //transactionCostSum = transactionCostSum.add(item.)
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
                    <td>${expenses.toString() + " " + currency}</td>
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