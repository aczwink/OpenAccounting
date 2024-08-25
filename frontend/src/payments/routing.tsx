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
import { AssociatePaymentComponent } from "./AssociatePaymentComponent";
import { CreatePaymentComponent } from "./CreatePaymentComponent";
import { EditPaymentDetailsComponent } from "./EditPaymentDetailsComponent";
import { ImportPaymentsComponent } from "./ImportPaymentsComponent";
import { ShowPaymentsComponent } from "./ShowPaymentsComponent";
import { ViewPaymentDetailsComponent } from "./ViewPaymentDetailsComponent";
import { PaymentsPerMonthComponent } from "./PaymentsPerMonthComponent";
import { OpenPaymentsComponent } from "./OpenPaymentsComponent";
import { CreateItemBasedOnPaymentComponent } from "./CreateItemBasedOnPaymentComponent";
import { LinkPaymentsComponent } from "./LinkPaymentsComponent";

const paymentListingRoutes: Routes = [
    { path: "month", component: PaymentsPerMonthComponent },
    { path: "open", component: OpenPaymentsComponent },
    { path: "", redirect: "open" },
];

const paymentRoutes: Routes = [
    { path: "associate/createitem", component: <CreateItemBasedOnPaymentComponent /> },
    { path: "associate", component: <AssociatePaymentComponent /> },
    { path: "edit", component: <EditPaymentDetailsComponent /> },
    { path: "link", component: <LinkPaymentsComponent /> },
    { path: "", component: <ViewPaymentDetailsComponent /> },
];

export const paymentsRoutes: Routes = [
    { path: "create", component: <CreatePaymentComponent /> },
    { path: "import", component: ImportPaymentsComponent },
    { path: "list", component: ShowPaymentsComponent, children: paymentListingRoutes },
    { path: "{paymentId}", children: paymentRoutes },
    { path: "", redirect: "list" },
];