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

import { APIController, Body, BodyProp, Get, Path, Post, Put } from "acts-util-apilib";
import { IdentitiesController, IdentityCreationData } from "../data-access/IdentitiesController";

@APIController("identities")
class _api_
{
    constructor(private identitiesController: IdentitiesController)
    {
    }

    @Post()
    public async CreateIdentity(
        @Body data: IdentityCreationData
    )
    {
        return await this.identitiesController.CreateIdentity(data);
    }

    @Get()
    public async RequestIdentities()
    {
        const identities = await this.identitiesController.QueryIdentities();
        return identities;
    }
}

@APIController("identities/{identityId}")
class _api2_
{
    constructor(private identitiesController: IdentitiesController)
    {
    }

    @Get()
    public async RequestIdentity(
        @Path identityId: number
    )
    {
        const identity = await this.identitiesController.QueryIdentity(identityId);
        return identity;
    }

    @Put()
    public async UpdateIdentity(
        @Path identityId: number,
        @Body data: IdentityCreationData
    )
    {
        await this.identitiesController.UpdateIdentity(identityId, data);
    }

    @Post("paymentAccounts")
    public async AddPaymentAccount(
        @Path identityId: number,
        @BodyProp paymentServiceId: number,
        @BodyProp externalAccount: string,
    )
    {
        await this.identitiesController.AddPaymentAccount(identityId, paymentServiceId, externalAccount);
    }

    @Get("subscriptions")
    public async RequestSubscriptions(
        @Path identityId: number
    )
    {
        return await this.identitiesController.QuerySubscriptions(identityId);
    }

    @Post("subscriptions")
    public async AssignSubscription(
        @Path identityId: number,
        @BodyProp subscriptionId: number,
        @BodyProp startYear: number,
        @BodyProp startMonth: number
    )
    {
        await this.identitiesController.AssignSubscription(identityId, subscriptionId, startYear, startMonth);
    }
}