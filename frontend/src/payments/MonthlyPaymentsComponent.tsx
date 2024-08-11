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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { APIService } from "../APIService";
import { YearMonthPicker } from "../YearMonthPicker";
import { PaymentDTO } from "../../dist/api";
import { PaymentsComponent } from "./PaymentsComponent";

@Injectable
export class MonthlyPaymentsComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        const date = new Date();
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.data = [];
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <YearMonthPicker month={this.month} onChanged={this.OnDateSelectionChanged.bind(this)} year={this.year} />
            <button type="button" className="btn btn-primary" onclick={this.OnSearch.bind(this)}>Query</button>
            {this.data === null ? <ProgressSpinner /> : <PaymentsComponent payments={this.data} />}
        </fragment>;
    }

    //Private state
    private year: number;
    private month: number;
    private data: PaymentDTO[] | null;

    //Event handlers
    private OnDateSelectionChanged(year: number, month: number)
    {
        this.year = year;
        this.month = month;
    }

    private async OnSearch()
    {
        const response = await this.apiService.payments.get({ month: this.month, year: this.year });
        this.data = response.data;
    }
}