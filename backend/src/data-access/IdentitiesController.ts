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

interface Identity
{
    id: number;
    name: string;
    paymentAccounts: PaymentAccountAssociation[];
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

    public async CreateIdentity(name: string)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const result = await exector.InsertRow("identities", { name });
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
        const row = await exector.SelectOne("SELECT id, name FROM identities WHERE id = ?", id);

        if(row === undefined)
            return undefined;

        const rows = await exector.Select<PaymentAccountAssociation>("SELECT paymentServiceId, externalAccount FROM identities_paymentAccounts WHERE identityId = ?", id);

        const result: Identity = {
            id: row.id,
            name: row.name,
            paymentAccounts: rows
        };

        return result;
    }
}