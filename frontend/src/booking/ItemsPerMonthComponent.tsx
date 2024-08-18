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

import { Component, DataLink, Injectable, JSX_CreateElement, JSX_Fragment, ProgressSpinner } from "acfrontend";
import { APIService } from "../APIService";
import { Item } from "../../dist/api";
import { ItemsListComponent } from "./ItemsListComponent";
import { AccountingMonthPicker, AccountingMonthSelection } from "../shared/AccountingMonthPicker";

@Injectable
export class ItemsPerMonthComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        this.accountingMonth = this.CreateStateLink<AccountingMonthSelection>({ month: 0, year: 0 });
        this.data = [];
    }
    
    protected Render(): RenderValue
    {
        return <>
            <AccountingMonthPicker selectionLink={this.accountingMonth} />
            {this.data === null ? <ProgressSpinner /> : <ItemsListComponent items={this.data} />}
        </>;
    }

    //Private state
    private accountingMonth: DataLink<AccountingMonthSelection>;
    private data: Item[] | null;

    //Private methods
    private async LoadData()
    {
        this.data = null;

        const selection = this.accountingMonth.value!;
        const response = await this.apiService.items.get({ month: selection.month, year: selection.year });
        this.data = response.data;
    }

    //Event handlers
    override OnInitiated(): void
    {
        this.accountingMonth.Bind(this.LoadData.bind(this));
    }
}