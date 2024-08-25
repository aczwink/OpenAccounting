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

import { DataLink, JSX_CreateElement, LineEdit } from "acfrontend";
import { GetDisplayLocale } from "./Locale";

function CurrencySymbolOrISO4217Code(iso4217Code: string)
{
    switch(iso4217Code)
    {
        case "EUR":
            return "€";
    }
    return iso4217Code;
}

function MoneyDisplayVersionToDecimal(amount: string)
{
    switch(GetDisplayLocale())
    {
        case "de":
            return amount.replace(",", ".");
    }
    return amount;
}

function RenderAmountAccordingToLocale(amount: string)
{
    switch(GetDisplayLocale())
    {
        case "de":
            return amount.replace(".", ",");
    }
    return amount;
}

function RenderAmountWithCurrency(amount: string, currency: string)
{
    return RenderAmountAccordingToLocale(amount) + " " + CurrencySymbolOrISO4217Code(currency);
}

export function RenderMonetaryValue(amount: string, currency: string)
{
    if(amount.startsWith("-"))
        return <span className="text-danger">{RenderAmountWithCurrency(amount, currency)}</span>;
    return RenderAmountWithCurrency(amount, currency);
}

export function RenderMonetaryEditControl(amount: DataLink<string>, currency: string)
{
    return <div className="input-group mb-3">
        <LineEdit value={RenderAmountAccordingToLocale(amount.value)} onChanged={x => amount.Set(MoneyDisplayVersionToDecimal(x))} />
        <span className="input-group-text">{CurrencySymbolOrISO4217Code(currency)}</span>
    </div>;
}