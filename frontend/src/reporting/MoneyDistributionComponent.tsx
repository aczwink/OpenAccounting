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
import { JSX_CreateElement, Use, UseAPI } from "acfrontend";
import { APIService } from "../APIService";
import { IdentityReferenceComponent } from "../identities/IdentityReferenceComponent";
import { MoneyDistributionDTO } from "../../dist/api";
import { PaymentServiceComponent } from "../payments/PaymentServiceComponent";
import { RenderMonetaryValue } from "../shared/money";

function ViewMoneyDistributionComponent(input: { data: MoneyDistributionDTO[]; })
{
    return <div className="container">
        <h3>Distribution of finances</h3>
        
        <table className="table table-sm table-striped">
            <thead>
                <th>Identity</th>
                <th>Account</th>
                <th>Amount</th>
            </thead>
            <tbody>
                {input.data.map(x => <tr>
                        <td><IdentityReferenceComponent identityId={x.identityId} /></td>
                        <td><PaymentServiceComponent paymentServiceId={x.paymentServiceId} /></td>
                        <td>{RenderMonetaryValue(x.amount, x.currency)}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>;
}

export function MoneyDistributionComponent()
{
    const apiState = UseAPI(() => Use(APIService).reporting.moneyDistributon.get());
    return apiState.success ? <ViewMoneyDistributionComponent data={apiState.data} /> : apiState.fallback;
}