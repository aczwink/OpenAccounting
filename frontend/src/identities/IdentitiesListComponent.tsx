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

import { Anchor, Component, Injectable, JSX_CreateElement, Use, UseAPI } from "acfrontend";
import { IdentityOverviewData } from "../../dist/api";
import { APIService } from "../APIService";

@Injectable
class InternalIdentitiesListComponent extends Component<{ identities: IdentityOverviewData[]; }>
{    
    protected Render(): RenderValue
    {
        return <div className="row justify-content-center">
            <div className="col-auto">
            <table className="table table-sm table-striped">
            <thead>
                <th>First name</th>
                <th>Last name</th>
            </thead>
            <tbody>
                {this.input.identities.map(x => <tr>
                    <td>
                        <Anchor route={"/identities/" + x.id}>{x.firstName}</Anchor>
                    </td>
                    <td>
                        <Anchor route={"/identities/" + x.id}>{x.lastName}</Anchor>
                    </td>
                </tr>)}
            </tbody>
            <caption>Showing {this.input.identities.length} identities.</caption>
        </table>
            </div>
        </div>;
        ;
    }
}

export function IdentitiesListComponent()
{
    const apiState = UseAPI(() => Use(APIService).identities.get(), data => data.SortBy(x => x.lastName));
    return apiState.success ? <InternalIdentitiesListComponent identities={apiState.data} /> : apiState.fallback;
}