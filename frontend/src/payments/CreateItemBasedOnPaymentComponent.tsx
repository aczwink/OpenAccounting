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

import { JSX_CreateElement, Router, Use, UseAPI, UseRouteParameter } from "acfrontend";
import { CreateItemComponent } from "../booking/CreateItemComponent";
import { APIService } from "../APIService";
import { PaymentDTO } from "../../dist/api";

function InternalCreateItemBasedOnPaymentComponent(input: { paymentId: number; payment: PaymentDTO; })
{
    function OnItemCreated(id: number)
    {
        Use(Router).RouteTo("/payments/" + input.paymentId + "/associate");
    }

    const p = input.payment;    
    return <CreateItemComponent init={ { amount: p.grossAmount, debtorId: p.senderId, timeStamp: p.timestamp } } onCreated={OnItemCreated} />;
}

export function CreateItemBasedOnPaymentComponent()
{
    const paymentId = UseRouteParameter("route", "paymentId", "unsigned");

    const apiState = UseAPI(() => Use(APIService).payments.details._any_.get(paymentId));
    return apiState.success ? <InternalCreateItemBasedOnPaymentComponent paymentId={paymentId} payment={apiState.data} /> : apiState.fallback;
}