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
import { YearMonthPicker } from "../shared/YearMonthPicker";
import { PaymentDTO } from "../../dist/api";
import { PaymentListComponent } from "./PaymentListComponent";

@Injectable
export class PaymentsPerMonthComponent extends Component
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
            {this.data === null ? <ProgressSpinner /> : <PaymentListComponent payments={this.data} />}
        </fragment>;
    }

    //Private state
    private year: number;
    private month: number;
    private data: PaymentDTO[] | null;

    //Private methods
    private async LoadData()
    {
        this.data = null;

        const response = await this.apiService.payments.get({ month: this.month, year: this.year });
        this.data = response.data;
    }

    //Event handlers
    private OnDateSelectionChanged(year: number, month: number)
    {
        this.year = year;
        this.month = month;
        this.LoadData();
    }

    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.accounting.last.get();
        this.year = response.data.year;
        this.month = response.data.month;

        this.LoadData();
    }
}