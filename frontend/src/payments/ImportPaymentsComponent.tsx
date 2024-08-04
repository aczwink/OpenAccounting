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

import { BootstrapIcon, Component, FileSelect, FormField, Injectable, JSX_CreateElement, ProgressSpinner, Router, Select } from "acfrontend";
import { APIService } from "../APIService";
import { PaymentService } from "../../dist/api";

@Injectable
export class ImportPaymentsComponent extends Component
{
    constructor(private apiService: APIService, private router: Router)
    {
        super();

        this.file = null;
        this.paymentsServices = null;
        this.selectedPaymentId = 0;
    }

    protected Render(): RenderValue
    {
        if(this.paymentsServices === null)
            return <ProgressSpinner />;

        return <fragment>
            <h4>Import payments</h4>
            <FormField title="Payment service">
                <Select onChanged={newValue => this.selectedPaymentId = parseInt(newValue[0])}>
                    {this.paymentsServices.map(x => <option selected={this.selectedPaymentId === x.id} value={x.id}>{x.name}</option>)}
                </Select>
            </FormField>
            <FormField title="File">
                <FileSelect onChanged={newValue => this.file = newValue} />
            </FormField>
            <button type="button" className="btn btn-primary" disabled={this.file === null} onclick={this.OnImport.bind(this)}><BootstrapIcon>upload</BootstrapIcon> Import</button>
        </fragment>;
    }

    //Private state
    private file: File | null;
    private paymentsServices: PaymentService[] | null;
    private selectedPaymentId: number;

    //Event handlers
    private async OnImport()
    {
        this.paymentsServices = null;
        await this.apiService.payments.post({ paymentServiceId: this.selectedPaymentId }, { paymentsData: this.file! });
        this.router.RouteTo("/payments");
    }

    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.payments.services.get();
        this.selectedPaymentId = response.data[0].id;
        this.paymentsServices = response.data;
    }
}