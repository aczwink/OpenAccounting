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
import { DBConnectionPool, DBFactory, DBResource, Injectable } from "acts-util-node";

@Injectable
export class DatabaseController
{
    constructor()
    {
        this.pool = null;
    }

    //Public methods
    public Close()
    {
        if(this.pool === null)
            return;
        this.pool.Close();
        this.pool = null;
    }

    public async CreateAnyConnectionQueryExecutor()
    {
        const instance = await this.GetPoolInstance();
        return instance.value.CreateAnyConnectionQueryExecutor();
    }

    public FirstDayOf(startYear: number, startMonth: number)
    {
        return startYear.toString() + "-" + startMonth.toString() + "-01"
    }

    public async GetFreeConnection()
    {
        const instance = await this.GetPoolInstance();
        return instance.value.GetFreeConnection();
    }

    //Private state
    private pool: DBResource<DBConnectionPool> | null;

    //Private methods
    private async GetPoolInstance()
    {
        if(this.pool === null)
        {
            const factory = new DBFactory;

            this.pool = await factory.CreateConnectionPool({
                type: "mysql",
                host: process.env.OPENACCOUNTING_DB_HOST!,
                username: process.env.OPENACCOUNTING_DB_USER!,
                password: process.env.OPENACCOUNTING_DB_PW!,
                defaultDatabase: "openaccounting"
            });
        }
        return this.pool;
    }
}