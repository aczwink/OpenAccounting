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

import { Component, FormField, JSX_CreateElement, NumberSpinner } from "acfrontend";

export function CurrentMonth()
{
    const date = new Date();
    return { month: date.getMonth(), year: date.getFullYear() };
}

export function NextMonth()
{
    const date = new Date();

    if(date.getMonth() === 12)
        return { month: 1, year: date.getFullYear() + 1 };
    return { month: date.getMonth(), year: date.getFullYear() };
}

export class YearMonthPicker extends Component<{ year: number; month: number; onChanged: (year: number, month: number) => void}>
{
    protected Render(): RenderValue
    {
        return <div className="row">
            <div className="col">
                <FormField title="Year">
                    <NumberSpinner value={this.input.year} onChanged={newValue => this.input.onChanged(newValue, this.input.month)} step={1} />
                </FormField>
            </div>
            <div className="col">
                <FormField title="Month">
                    <NumberSpinner value={this.input.month} onChanged={newValue => this.input.onChanged(this.input.year, newValue)} step={1} />
                </FormField>
            </div>
        </div>;
    }
}