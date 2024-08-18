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

@Injectable
export class AccountingMonthsController
{
    constructor(private dbController: DatabaseController)
    {
    }

    //Public methods
    public async Add(year: number, month: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        await exector.InsertRow("accountingMonths", { year, month });
    }

    public async Exists(year: number, month: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row = await exector.SelectOne("SELECT TRUE FROM accountingMonths WHERE year = ? AND month = ?", year, month);
        if(row === undefined)
            return false;
        return true;
    }

    public async QueryAllAccountingMonths()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select<{ year: number; month: number }>("SELECT year, month FROM accountingMonths");
        return rows;
    }

    public async QueryLast()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const row1 = await exector.SelectOne("SELECT MAX(year) AS year FROM accountingMonths");
        if((row1 === undefined) || (row1.year === null))
            return undefined;

        const year = row1.year as number;
        const row2 = await exector.SelectOne("SELECT MAX(month) AS month FROM accountingMonths WHERE year = ?", year);

        return { year, month: row2!.month as number };
    }

    public async QueryMonthsOfYear(year: number)
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT month FROM accountingMonths WHERE year = ?", year);
        return rows.map<number>(x => x.month);
    }

    public async QueryYears()
    {
        const exector = await this.dbController.CreateAnyConnectionQueryExecutor();
        const rows = await exector.Select("SELECT DISTINCT year FROM accountingMonths");
        return rows.map<number>(x => x.year);
    }
}