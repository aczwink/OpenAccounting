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

import { I18n, JSX_CreateElement, JSX_Fragment, NavItem, RouterComponent } from "acfrontend";

export function BookingComponent()
{
    return <>
        <ul className="nav nav-tabs justify-content-center">
            <NavItem route="/booking/open"><I18n key="nav.open_items" /></NavItem>
            <NavItem route="/booking/month">Items per month</NavItem>
            <NavItem route="/booking/accountingmonths">Accounting months</NavItem>
        </ul>
        <RouterComponent />
        <br />
    </>;
}