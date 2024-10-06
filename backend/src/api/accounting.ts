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

import { APIController, BodyProp, Get, Path, Post, Put } from "acts-util-apilib";
import { AccountingMonthService } from "../services/AccountingMonthService";
import { AccountingMonthsController } from "../data-access/AccountingMonthsController";

@APIController("accounting")
class _api_
{
    constructor(private accountingMonthService: AccountingMonthService, private accountingMonthsController: AccountingMonthsController)
    {
    }

    @Get()
    public RequestAllAccountingMonths()
    {
        return this.accountingMonthsController.QueryAllAccountingMonths();
    }

    @Get("last")
    public async RequestLastAccountingMonth()
    {
        const last = await this.accountingMonthsController.QueryLast();
        if(last === undefined)
        {
            const date = new Date();
            return { month: date.getMonth(), year: date.getFullYear() };
        }
        return last;
    }

    @Get("next")
    public async RequestNextAccountingMonth()
    {
        const last = await this.accountingMonthsController.QueryLast();
        if(last === undefined)
        {
            const date = new Date();
            return { month: date.getMonth(), year: date.getFullYear() };
        }

        if(last.month === 12)
            return { month: 1, year: last.year + 1 };
        return { month: last.month + 1, year: last.year };
    }

    @Get("years")
    public RequestAccountingYears()
    {
        return this.accountingMonthsController.QueryYears();
    }

    @Get("years/{year}/months")
    public RequestAccountingMonths(
        @Path year: number
    )
    {
        return this.accountingMonthsController.QueryMonthsOfYear(year);
    }

    @Post("years/{year}/months")
    public async CreateAccountingMonth(
        @Path year: number,
        @BodyProp month: number
    )
    {
        await this.accountingMonthService.CreateAccountingMonth(year, month);
    }

    @Put("years/{year}/months/{month}")
    public async SetAccountingMonthLockStatus(
        @Path year: number,
        @Path month: number,
        @BodyProp locked: boolean
    )
    {
        await this.accountingMonthService.SetLockStatus(year, month, locked);
    }
}