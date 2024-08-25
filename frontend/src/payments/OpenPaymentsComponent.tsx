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

import { Anchor, BootstrapIcon, Component, Injectable, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { APIService } from "../APIService";
import { PaymentListComponent } from "./PaymentListComponent";
import { PaymentDTO } from "../../dist/api";

@Injectable
export class OpenPaymentsComponent extends Component
{
    constructor(private apiService: APIService)
    {
        super();

        this.data = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;
        return <PaymentListComponent payments={this.data} renderAdditionalActions={this.RenderActions.bind(this)} />
    }

    //Private state
    private data: PaymentDTO[] | null;

    //Private methods
    private RenderActions(payment: PaymentDTO)
    {
        return <div className="dropdown">
            <button className="btn btn-sm btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <BootstrapIcon>link</BootstrapIcon> Link
            </button>
            <ul className="dropdown-menu">
                <li><Anchor className="dropdown-item" route={"/payments/" + payment.id + "/associate"}>with item</Anchor></li>
                <li><Anchor className="dropdown-item" route={"/payments/" + payment.id + "/link"}>with payment</Anchor></li>
            </ul>
        </div>;
    }

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.payments.open.get();
        this.data = response.data;    
    }
}