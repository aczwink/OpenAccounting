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

import { APIController, Get, Query } from "acts-util-apilib";
import { AssetController } from "../data-access/AssetController";

@APIController("assets")
class _api_
{
    constructor(private assetController: AssetController)
    {
    }
    
    @Get()
    public async QueryAsset(
        @Query assetName: string
    )
    {
        const asset = await this.assetController.QueryAsset(assetName);
        return asset;
    }

    @Get("blob")
    public async QueryAssetBinary(
        @Query assetName: string
    )
    {
        const asset = await this.assetController.QueryAssetBinary(assetName);
        return asset;
    }
}