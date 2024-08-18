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

import { DateTime, Injectable } from "acts-util-node";
import { AccountingMonthsController } from "../data-access/AccountingMonthsController";
import { IdentitiesController } from "../data-access/IdentitiesController";
import { ItemsController } from "../data-access/ItemsController";
import { SubscriptionsController } from "../data-access/SubscriptionsController";
import { LanguageService } from "./LanguageService";

@Injectable
export class AccountingMonthService
{
    constructor(private accountingMonthsController: AccountingMonthsController, private identitiesController: IdentitiesController, private itemsController: ItemsController, private subscriptionsController: SubscriptionsController,
        private languageService: LanguageService
    )
    {
    }
    
    //Public methods
    public async CalculateUTCRangeOfAccountingMonth(year: number, month: number)
    {
        const timeZone = await this.languageService.GetBookingTimeZone();

        const start = DateTime.Construct(year, month, 1, 0, 0, 0, timeZone);
        return {
            inclusiveStart: start,
            inclusiveEnd: start.EndOfMonth()
        };
    }

    public async CreateAccountingMonth(year: number, month: number)
    {
        const timeZone = await this.languageService.GetBookingTimeZone();
        const bookingTimeStamp = DateTime.Construct(year, month, 1, 0, 0, 0, timeZone);

        const exists = await this.accountingMonthsController.Exists(year, month);
        if(exists)
            throw new Error("Accounting month has been created already");

        const subscriptionAssignments = await this.identitiesController.QueryActiveSubscriptionAssignments(year, month);
        for (const assignment of subscriptionAssignments)
        {
            const subscription = await this.subscriptionsController.QuerySubscription(assignment.subscriptionId);

            await this.itemsController.CreateSubscriptionItem({
                debtorId: assignment.identityId,
                subscriptionId: assignment.subscriptionId,
                amount: subscription!.price,
                timestamp: bookingTimeStamp
            });
        }

        await this.accountingMonthsController.Add(year, month);
    }
}