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
import { Identity } from "../../dist/api";
import { CachedAPIService } from "../CachedAPIService";

@Injectable
export class IdentityReferenceComponent extends Component<{ identityId: number }>
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
        return <Anchor route={"/identities/" + this.data.id}>{this.data.firstName} {this.data.lastName}</Anchor>;
    }

    //Private state
    private data: Identity | null;

    //Private methods
    private async LoadIdentity()
    {
        this.data = await this.cachedAPIService.RequestIdentity(this.input.identityId);
    }

    //Event handlers
    override OnInitiated(): void
    {
        this.LoadIdentity();
    }

    override OnInputChanged(): void
    {
        this.data = null;
        this.LoadIdentity();
    }
}