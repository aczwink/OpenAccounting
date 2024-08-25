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

import { Anchor, JSX_CreateElement, ProgressSpinner, Use, UseEffectOnce, UseState } from "acfrontend";
import { CachedAPIService } from "../CachedAPIService";
import { ProductDTO } from "../../dist/api";

export function ProductReferenceComponent(input: { id: number })
{
    const state = UseState({
        product: null as ProductDTO | null
    });
    UseEffectOnce(async () => state.product = await Use(CachedAPIService).RequestProduct(input.id));

    if(state.product === null)
        return <ProgressSpinner />;
    return <Anchor route={"/products/" + state.product.id}>{state.product.title}</Anchor>;
}