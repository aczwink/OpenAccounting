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

import { Component, Injectable, JSX_CreateElement, NavItem, Navigation, ProgressSpinner, RouterComponent, TitleService } from "acfrontend";
import { APIService } from "./APIService";

@Injectable
export class RootComponent extends Component
{
    constructor(private apiService: APIService, private titleService: TitleService)
    {
        super();

        this.title = null;
        this.logo = null;
    }

    protected Render()
    {
        return <fragment>
            <Navigation>
                <div className="navbar-brand">
                    {this.logo === null ? <ProgressSpinner /> : <img src={this.logo} style="height: 48px" className="d-inline-block align-text-center" />}
                    {this.title === null ? <ProgressSpinner /> : this.title}
                </div>
                <ul className="nav nav-pills">
                    <NavItem route="/booking">Booking</NavItem>
                    <NavItem route="/payments">Payments</NavItem>
                    <NavItem route="/monthlybilling">Monthly bill</NavItem>
                </ul>
            </Navigation>
            <div className="container-fluid">
                <RouterComponent />
            </div>
        </fragment>;
    }

    //Private state
    private title: string | null;
    private logo: string | null;

    //Private methods
    private BlobToBase64(blob: Blob)
    {
        return new Promise<string>((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as any);
            reader.readAsDataURL(blob);
        });
      }
      

    //Event handlers
    override async OnInitiated(): Promise<void>
    {
        const response = await this.apiService.assets.get({ assetName: "name" });
        this.title = response.data;
        this.titleService.title = this.title;

        const response2 = await this.apiService.assets.blob.get({ assetName: "logo" });
        this.logo = await this.BlobToBase64(response2.data);
    }
}