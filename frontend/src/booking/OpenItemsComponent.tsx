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
import { ItemsListComponent } from "./ItemsListComponent";
import { Item } from "../../dist/api";

export function OpenItemsComponent()
{
    function Actions(item: Item)
    {
        return <RouterButton className="btn-sm" color="secondary" route={"/booking/items/" + item.id + "/createpayment"}><BootstrapIcon>plus</BootstrapIcon> Create payment</RouterButton>;
    }

    const apiState = UseAPI(() => Use(APIService).items.open.get());

    if(apiState.success)
    {
        if(apiState.data.length === 0)
        {
            return <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-auto"><h3>Great work. No open items exist...</h3></div>
                    <div className="col-auto text-primary"><h1><BootstrapIcon>emoji-smile-upside-down</BootstrapIcon></h1></div>
                </div>
            </div>
        }
        return <ItemsListComponent items={apiState.data} renderAdditionalActions={Actions} />;
    }
    return apiState.fallback;
}