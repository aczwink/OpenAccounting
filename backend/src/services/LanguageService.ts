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

import { Injectable } from "acts-util-node";
import { AssetController } from "../data-access/AssetController";

@Injectable
export class LanguageService
{
    constructor(private assetController: AssetController)
    {
    }

    //Public methods
    public async GetBookingTimeZone()
    {
        const tz = await this.assetController.QueryAsset("bookingTimeZone");
        return tz!;
    }

    public async GetBCP47Tag()
    {
        const lang = await this.assetController.QueryAsset("language");
        switch(lang)
        {
            case "de":
                return "de-DE";
            default:
                throw new Error("unsupported language: " + lang);
        }
    }

    public async GetNativeCurrency()
    {
        const currency = await this.assetController.QueryAsset("nativeCurrency");
        return currency!;
    }
}