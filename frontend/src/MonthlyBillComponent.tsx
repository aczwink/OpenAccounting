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

import { Injectable, Component, JSX_CreateElement, ProgressSpinner, FileDownloadService, InfoMessageManager } from "acfrontend";
import { YearMonthPicker } from "./YearMonthPicker";
import { APIService } from "./APIService";

@Injectable
export class MonthlyBillComponent extends Component
{
    constructor(private apiService: APIService, private fileDownloadService: FileDownloadService, private infoMessageManager: InfoMessageManager)
    {
        super();

        const date = new Date();
        this.year = date.getFullYear();
        this.month = date.getMonth();
        this.loading = false;
    }

    protected Render(): RenderValue
    {
        const color = this.loading ? "secondary" : "primary";
        return <fragment>
            <YearMonthPicker month={this.month} onChanged={this.OnSelectionChanged.bind(this)} year={this.year} />
            <button type="button" className={"btn btn-" + color} onclick={this.OnGenerateInvoice.bind(this)} disabled={this.loading}>{this.loading ? <ProgressSpinner /> : "Generate"}</button>
        </fragment>;
    }

    //Private state
    private year: number;
    private month: number;
    private loading: boolean;

    //Event handlers
    private async OnGenerateInvoice()
    {
        this.loading = true;

        const response = await this.apiService.invoices.get({ month: this.month, year: this.year });
        if(response.statusCode === 200)
            this.fileDownloadService.DownloadBlobAsFile(response.data, "invoice-" + this.year + "-" + this.month + ".pdf");
        else
            this.infoMessageManager.ShowMessage("An error occured", {});

        this.loading = false;
    }

    private OnSelectionChanged(year: number, month: number)
    {
        this.year = year;
        this.month = month;
    }
}