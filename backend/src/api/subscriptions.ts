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

import { APIController, Body, Get, Path, Post } from "acts-util-apilib";
import { SubscriptionCreationData, SubscriptionsController } from "../data-access/SubscriptionsController";

@APIController("subscriptions")
class _api_
{
    constructor(private subscriptionsController: SubscriptionsController)
    {
    }

    @Get()
    public async RequestSubscriptions()
    {
        return await this.subscriptionsController.QuerySubscriptions();
    }

    @Post()
    public async CreateSubscription(
        @Body data: SubscriptionCreationData)
    {
        return this.subscriptionsController.CreateSubscription(data);
    }

    @Get("{id}")
    public async RequestSubscription(
        @Path id: number
    )
    {
        return await this.subscriptionsController.QuerySubscription(id);
    }
}