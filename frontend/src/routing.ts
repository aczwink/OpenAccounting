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

import { JSX_CreateElement, Routes } from "acfrontend";
import { MonthlyBillComponent } from "./MonthlyBillComponent";
import { ShowPaymentsComponent } from "./payments/ShowPaymentsComponent";
import { BookingComponent } from "./BookingComponent";
import { OpenPaymentsComponent } from "./payments/OpenPaymentsComponent";
import { MonthlyPaymentsComponent } from "./payments/MonthlyPaymentsComponent";
import { ImportPaymentsComponent } from "./payments/ImportPaymentsComponent";
import { IdentitiesListComponent } from "./identities/IdentitiesListComponent";
import { ShowIdentityComponent } from "./identities/ShowIdentityComponent";
import { SubscriptionListComponent } from "./subscriptions/SubscriptionListComponent";
import { ItemsListComponent } from "./items/ItemsListComponent";

const identitiesRoutes: Routes = [
    { path: ":identityId", component: ShowIdentityComponent },
    { path: "", component: IdentitiesListComponent },
];

const itemsRoutes: Routes = [
    { path: "", component: ItemsListComponent },
];

const paymentListingRoutes: Routes = [
    { path: "month", component: MonthlyPaymentsComponent },
    { path: "open", component: OpenPaymentsComponent },
    { path: "", redirect: "open" },
];

const paymentsRoutes: Routes = [
    { path: "import", component: ImportPaymentsComponent },
    { path: "", component: ShowPaymentsComponent, children: paymentListingRoutes },
];

const subscriptionsRoutes: Routes = [
    { path: "", component: SubscriptionListComponent },
];

export const routes : Routes = [
    { path: "booking", component: BookingComponent },
    { path: "identities", children: identitiesRoutes },
    { path: "items", children: itemsRoutes },
    { path: "monthlybilling", component: MonthlyBillComponent },
    { path: "payments", children: paymentsRoutes },
    { path: "subscriptions", children: subscriptionsRoutes },
    { path: "", redirect: "monthlybilling" },
    { path: "*", component: JSX_CreateElement("p", { textContent: "404" }) }
];