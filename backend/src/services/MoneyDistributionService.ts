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

import { Injectable } from "acts-util-node";
import { PaymentLinkReason, PaymentsController } from "../data-access/PaymentsController";
import { FinanceService } from "./FinanceService";
import { Money } from "@dintero/money";

type MoneyDeposits = Map<number, Money>;
interface MoneyDistributionEntry
{
    identityId: number;
    paymentServiceId: number;
    amount: Money;
}

@Injectable
export class MoneyDistributionService
{
    constructor(private paymentsController: PaymentsController, private financeService: FinanceService)
    {
    }

    public async Compute()
    {
        const deposits = new Map<number, MoneyDeposits>();

        const cashServices = await this.paymentsController.QueryServices("cash");
        const cashServiceId = cashServices[0].id;

        const payments = await this.paymentsController.QueryNonOpenPayments();
        for (const payment of payments)
        {
            const netAmount = this.financeService.ComputeNetAmount(payment);
            this.AddToDeposit(deposits, payment.receiverId, payment.paymentServiceId, netAmount);

            const links = await this.paymentsController.QueryPaymentLinks(payment.id, "outgoing");
            if(links.length > 0)
            {
                for (const link of links)
                {
                    switch(link.reason)
                    {
                        case PaymentLinkReason.CashDeposit:
                            //subtract amount from sender deposit
                            this.AddToDeposit(deposits, payment.senderId, cashServiceId, Money.of("-" + link.amount, payment.currency));
                            break;
                        default:
                            throw new Error("NOT IMPLEMENTED");
                    }
                }
            }
        }

        return deposits.Entries().Map(kv => 
            kv.value.Entries().Map<MoneyDistributionEntry>(kv2 => ({
                amount: kv2.value!,
                identityId: kv.key,
                paymentServiceId: kv2.key
            }))
        ).Flatten().Filter(x => !x.amount.isZero()).ToArray();
    }

    //Private methods
    private AddToDeposit(deposits: Map<number, MoneyDeposits>, receiverId: number, paymentServiceId: number, amount: Money)
    {
        const d = this.GetDepositOf(deposits, receiverId);
        const oldValue = d.get(paymentServiceId);
        if(oldValue === undefined)
            d.set(paymentServiceId, amount);
        else
            d.set(paymentServiceId, oldValue.add(amount));
    }

    private GetDepositOf(deposits: Map<number, MoneyDeposits>, receiverId: number): MoneyDeposits
    {
        const d = deposits.get(receiverId);
        if(d === undefined)
        {
            const d = new Map();
            deposits.set(receiverId, d);
            return d;
        }
        return d;
    }
}