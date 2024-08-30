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
import { BookingComponent } from "./booking/BookingComponent";
import { IdentitiesListComponent } from "./identities/IdentitiesListComponent";
import { ShowIdentityComponent } from "./identities/ShowIdentityComponent";
import { SubscriptionListComponent } from "./subscriptions/SubscriptionListComponent";
import { ProductListComponent } from "./products/ProductListComponent";
import { AddSubscriptionComponent } from "./subscriptions/AddSubscriptionComponent";
import { ShowSubscriptionComponent } from "./subscriptions/ShowSubscriptionComponent";
import { EditIdentityComponent } from "./identities/EditIdentityComponent";
import { CreateAccountingMonthComponent } from "./booking/CreateAccountingMonthComponent";
import { AccountingMonthsListComponent } from "./booking/AccountingMonthsListComponent";
import { OpenItemsComponent } from "./booking/OpenItemsComponent";
import { ItemsPerMonthComponent } from "./booking/ItemsPerMonthComponent";
import { ViewItemDetailsComponent } from "./booking/ViewItemDetailsComponent";
import { CreateProductComponent } from "./products/CreateProductComponent";
import { ViewProductComponent } from "./products/ViewProductComponent";
import { MoneyDistributionComponent } from "./reporting/MoneyDistributionComponent";
import { paymentsRoutes } from "./payments/routing";
import { CreatePaymentBasedOnItem } from "./booking/CreatePaymentBasedOnItem";
import { CreateIdentityComponent } from "./identities/CreateIdentityComponent";

const bookingListingRoutes: Routes = [
    { path: "accountingmonths/create", component: <CreateAccountingMonthComponent /> },
    { path: "accountingmonths", component: <AccountingMonthsListComponent /> },
    { path: "month", component: ItemsPerMonthComponent },
    { path: "open", component: <OpenItemsComponent /> },
    { path: "", redirect: "open" },
];

const bookingRoutes: Routes = [
    { path: "items/{itemId}/createpayment", component: <CreatePaymentBasedOnItem /> },
    { path: "items/{itemId}", component: <ViewItemDetailsComponent /> },
    { path: "", component: <BookingComponent />, children: bookingListingRoutes },
];

const identitiesRoutes: Routes = [
    { path: "create", component: <CreateIdentityComponent /> },
    { path: "edit/{identityId}", component: <EditIdentityComponent /> },
    { path: "{identityId}", component: ShowIdentityComponent },
    { path: "", component: <IdentitiesListComponent /> },
];

const productsRoutes: Routes = [
    { path: "add", component: <CreateProductComponent /> },
    { path: "{productId}", component: <ViewProductComponent /> },
    { path: "", component: <ProductListComponent /> },
];

const reportingRoutes: Routes = [
    { path: "moneydistribution", component: <MoneyDistributionComponent /> },
    { path: "", redirect: "moneydistribution" }
];

const subscriptionsRoutes: Routes = [
    { path: "add", component: <AddSubscriptionComponent /> },
    { path: "{subscriptionId}", component: <ShowSubscriptionComponent /> },
    { path: "", component: SubscriptionListComponent },
];

export const routes : Routes = [
    { path: "booking", children: bookingRoutes },
    { path: "identities", children: identitiesRoutes },
    { path: "monthlybilling", component: MonthlyBillComponent },
    { path: "payments", children: paymentsRoutes },
    { path: "products", children: productsRoutes },
    { path: "reporting", children: reportingRoutes },
    { path: "subscriptions", children: subscriptionsRoutes },
    { path: "", redirect: "booking" },
    { path: "*", component: JSX_CreateElement("p", { textContent: "404" }) }
];