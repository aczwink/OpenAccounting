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
import { Identity, PaymentService } from "../dist/api";
import { NumberDictionary } from "../../../ACTS-Util/core/dist/Dictionary";

@Injectable
export class CachedAPIService
{
    constructor(private apiService: APIService)
    {
        this.cachedServices = null;
        this.cachedIdentities = {};
    }

    //Public methods
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
        if(this.cachedServices === null)
        {
            const response = await this.apiService.payments.services.get();
            this.cachedServices = response.data;
        }
        return this.cachedServices.find(x => x.id === id)!;
    }

    //State
    private cachedServices: PaymentService[] | null;
    private cachedIdentities: NumberDictionary<Identity>;
}