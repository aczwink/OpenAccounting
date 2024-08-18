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

import { BootstrapIcon, JSX_CreateElement, RouterButton, Use, UseAPI } from "acfrontend";
import { APIService } from "../APIService";

function AccountingMonthsTable(input: { accountingMonths: { month: number; year: number }[] })
{
    return <div className="row justify-content-center">
        <div className="col-2">
            <table className="table table-sm table-striped">
                <thead>
                    <th>Year</th>
                    <th>Month</th>
                </thead>
                <tbody>
                    {input.accountingMonths.map(x => <tr>
                        <td>{x.year}</td>
                        <td>{x.month}</td>
                    </tr>)}
                </tbody>
                <caption>Showing {input.accountingMonths.length} accounting months.</caption>
            </table>
        </div>
    </div>;
}

export function AccountingMonthsListComponent()
{
    const apiState = UseAPI(() => Use(APIService).accounting.get());

    return <div className="container">
        {apiState.success ? <AccountingMonthsTable accountingMonths={apiState.data} /> : apiState.fallback}
        <RouterButton color="primary" route="/booking/accountingmonths/create"><BootstrapIcon>plus</BootstrapIcon> Create</RouterButton>
    </div>;
}