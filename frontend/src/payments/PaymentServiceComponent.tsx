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

import { BootstrapIcon, Component, Injectable, JSX_CreateElement, JSX_Fragment, ProgressSpinner } from "acfrontend";
import { FullPaymentServiceData } from "../../dist/api";
import { CachedAPIService } from "../CachedAPIService";

@Injectable
export class PaymentServiceComponent extends Component<{ paymentServiceId: number }>
{
    constructor(private cachedAPIService: CachedAPIService)
    {
        super();

        this.data = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;
        return <>
            {this.data.name + " "}
            <span className="text-primary"><BootstrapIcon>{this.RenderIcon(this.data.type)}</BootstrapIcon></span>
        </>;
    }

    //Private state
    private data: FullPaymentServiceData | null;

    //Private methods
    private RenderIcon(type: "cash" | "paypal")
    {
        switch(type)
        {
            case "cash":
                return "cash-coin";
            case "paypal":
                return "paypal";
        }
    }

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        this.data = await this.cachedAPIService.RequestPaymentService(this.input.paymentServiceId);
    }
}