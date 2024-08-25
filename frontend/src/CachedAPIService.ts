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

import { Injectable } from "acfrontend";
import { APIService } from "./APIService";
import { FullPaymentServiceData, Identity, ProductDTO, Subscription } from "../dist/api";
import { NumberDictionary } from "../../../ACTS-Util/core/dist/Dictionary";

@Injectable
export class CachedAPIService
{
    constructor(private apiService: APIService)
    {
        this.cachedAccountingMonths = {};
        this.cachedAccountingYears = null;
        this.cachedServices = {};
        this.cachedIdentities = {};
        this.cachedProducts = {};
        this.cachedSubscriptions = {};
    }

    //Public methods
    public async RequestAccountingMonthsOfYear(year: number)
    {
        const months = this.cachedAccountingMonths[year];
        if(months === undefined)
        {
            const response = await this.apiService.accounting.years._any_.months.get(year);
            this.cachedAccountingMonths[year] = response.data;
            return response.data;
        }
        return months;
    }

    public async RequestAccountingYears()
    {
        if(this.cachedAccountingYears === null)
        {
            const response = await this.apiService.accounting.years.get();
            this.cachedAccountingYears = response.data;
        }
        return this.cachedAccountingYears;
    }

    public async RequestIdentity(id: number)
    {
        const identity = this.cachedIdentities[id];
        if(identity === undefined)
        {
            const response = await this.apiService.identities._any_.get(id);
            if(response.statusCode === 200)
            {
                this.cachedIdentities[id] = response.data;
                return response.data;
            }
        }
        return identity!;
    }

    public async RequestPaymentService(id: number)
    {
        const service = this.cachedServices[id];
        if(service === undefined)
        {
            const response = await this.apiService.payments.services._any_.get(id);
            this.cachedServices[id] = response.data;
            return response.data;
        }
        return service;
    }

    public async RequestProduct(id: number)
    {
        const product = this.cachedProducts[id];
        if(product === undefined)
        {
            const response = await this.apiService.products._any_.get(id);
            if(response.statusCode === 200)
            {
                this.cachedProducts[id] = response.data;
                return response.data;
            }
        }
        return product!;
    }

    public async RequestSubscription(id: number)
    {
        const subscription = this.cachedSubscriptions[id];
        if(subscription === undefined)
        {
            const response = await this.apiService.subscriptions._any_.get(id);
            if(response.statusCode === 200)
            {
                this.cachedSubscriptions[id] = response.data;
                return response.data;
            }
        }
        return subscription!;
    }

    //State
    private cachedAccountingMonths: NumberDictionary<number[]>;
    private cachedAccountingYears: number[] | null;
    private cachedServices: NumberDictionary<FullPaymentServiceData>;
    private cachedIdentities: NumberDictionary<Identity>;
    private cachedProducts: NumberDictionary<ProductDTO>;
    private cachedSubscriptions: NumberDictionary<Subscription>;
}