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

import { APIController, Get } from "acts-util-apilib";
import { MoneyDistributionService } from "../services/MoneyDistributionService";

interface MoneyDistributionDTO
{
    amount: string;
    currency: string;
    identityId: number;
    paymentServiceId: number;
}

@APIController("reporting")
class _api_
{
    constructor(private moneyDistributionService: MoneyDistributionService)
    {
    }

    @Get("moneyDistributon")
    public async RequestMoneyDistribution()
    {
        const deposits = await this.moneyDistributionService.Compute();
        return deposits.map<MoneyDistributionDTO>(x => ({
            amount: x.amount.toString(),
            currency: x.amount.currency(),
            identityId: x.identityId,
            paymentServiceId: x.paymentServiceId
        }));
    }
}