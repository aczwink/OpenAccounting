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
import { DatabaseController } from "./DatabaseController";

interface PaymentAccountAssociation
{
    paymentServiceId: number;
    externalAccount: string;
}

interface IdentityOverviewData
{
    id: number;
    firstName: string;
    lastName: string;
}

export interface IdentityCreationData
{
    firstName: string;
    lastName: string;
    notes: string;
}

interface Identity extends IdentityCreationData
{
    id: number;
    paymentAccounts: PaymentAccountAssociation[];
}

interface SubscriptionAssignment
{
    identityId: number;
    subscriptionId: number;
    begin: string;
    end: string | null;
}

@Injectable
export class IdentitiesController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async AddPaymentAccount(id: number, paymentServiceId: number, externalAccount: string)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.InsertRow("identities_paymentAccounts", {
            identityId: id,
            paymentServiceId,
            externalAccount
        });
    }

    public async AssignSubscription(identityId: number, subscriptionId: number, startYear: number, startMonth: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.InsertRow("identities_subscriptions", {
            identityId,
            subscriptionId,
            begin: this.dbController.FirstDayOf(startYear, startMonth),
            end: null
        });
    }

    public async CreateIdentity(data: IdentityCreationData)
    {        
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("identities", data);
        return result.insertId;
    }

    public async FindIdentity(paymentServiceId: number, externalAccount: string)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne("SELECT identityId FROM identities_paymentAccounts WHERE paymentServiceId = ? AND externalAccount = ?", paymentServiceId, externalAccount);
        return row?.identityId as (number | undefined);
    }

    public async QueryIdentity(id: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne("SELECT id, firstName, lastName, notes FROM identities WHERE id = ?", id);

        if(row === undefined)
            return undefined;

        const rows = await exector.Select<PaymentAccountAssociation>("SELECT paymentServiceId, externalAccount FROM identities_paymentAccounts WHERE identityId = ?", id);

        const result: Identity = {
            id: row.id,
            firstName: row.firstName,
            lastName: row.lastName,
            paymentAccounts: rows,
            notes: row.notes
        };

        return result;
    }

    public async QueryIdentities()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<IdentityOverviewData>("SELECT id, firstName, lastName FROM identities");
        return rows;
    }

    public async QueryActiveSubscriptionAssignments(year: number, month: number)
    {
        const query = `
        SELECT *
        FROM identities_subscriptions
        WHERE
            (begin <= ?)
            AND
            (
                (end IS NULL)
                OR
                (end >= ?)
            )
        `;
        
        const day = this.dbController.FirstDayOf(year, month)
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        return await exector.Select<SubscriptionAssignment>(query, day, day);
    }

    public async QuerySubscriptions(identityId: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT * FROM identities_subscriptions WHERE identityId = ?", identityId);

        return rows.map<SubscriptionAssignment>(row => ({
            identityId: row.identityId,
            begin: row.begin,
            end: row.end,
            subscriptionId: row.subscriptionId
        }));        
    }

    public async UpdateIdentity(identityId: number, data: IdentityCreationData)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.UpdateRows("identities", data, "id = ?", identityId);
    }
}