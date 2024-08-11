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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner, RouterState } from "acfrontend";
import { Identity } from "../../dist/api";
import { CachedAPIService } from "../CachedAPIService";
import { PaymentServiceComponent } from "../payments/PaymentServiceComponent";

@Injectable
export class ShowIdentityComponent extends Component
{
    constructor(private cachedAPIService: CachedAPIService, private routerState: RouterState)
    {
        super();

        this.data = null;
    }
    
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h3>{this.data.name}</h3>

            <hr />
            <h5>Payment accounts</h5>
            <table className="table table-sm table-striped">
            <thead>
                <th>Payment service</th>
                <th>Account</th>
            </thead>
            <tbody>
                {this.data.paymentAccounts.map(x => <tr>
                    <td><PaymentServiceComponent paymentServiceId={x.paymentServiceId} /></td>
                    <td>{x.externalAccount}</td>
                </tr>)}
            </tbody>
        </table>
        </fragment>;
    }

    //Private state
    private data: Identity | null;

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const id = parseInt(this.routerState.routeParams.identityId!);
        this.data = await this.cachedAPIService.RequestIdentity(id);
    }
}