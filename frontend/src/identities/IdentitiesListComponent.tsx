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

import { Anchor, Component, Injectable, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { IdentityOverviewData } from "../../dist/api";
import { APIService } from "../APIService";

@Injectable
export class IdentitiesListComponent extends Component
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

        return <table className="table table-sm table-striped">
            <thead>
                <th>Name</th>
            </thead>
            <tbody>
                {this.data.map(x => <tr>
                    <td>
                        <Anchor route={"/identities/" + x.id}>{x.name}</Anchor>
                    </td>
                </tr>)}
            </tbody>
            <caption>Showing {this.data.length} identities.</caption>
        </table>;
    }

    //Private state
    private data: IdentityOverviewData[] | null;

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.identities.get();
        response.data.SortBy(x => x.name);
        this.data = response.data;
    }
}