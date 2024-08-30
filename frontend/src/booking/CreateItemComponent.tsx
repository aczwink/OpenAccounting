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

import { DataLink, DateTimePicker, FormField, JSX_CreateElement, JSX_Fragment, PushButton, RadioButton, Select, TextArea, Use, UseAPI, UseDeferredAPI, UseState } from "acfrontend";
import { APIService } from "../APIService";
import { IdentityOverviewData, ItemSaleType, ProductDTO, Subscription } from "../../dist/api";
import { RenderMonetaryEditControl } from "../shared/money";
import { Of } from "acts-util-core";

interface ItemInitValues
{
    timeStamp: Date;
    debtorId: number;
    amount: string;
}

type SaleType = "product" | "subscription" | "other";
function IsValid(type: SaleType, productId: number, subscriptionId: number, note: string)
{
    switch(type)
    {
        case "product":
            return productId !== 0;
        case "subscription":
            return subscriptionId !== 0;
        case "other":
            return note.trim().length > 0;
    }
}

function RenderAmountEdit(condition: boolean, amount: DataLink<string>)
{
    if(!condition)
        return null;

    return<FormField title="Amount">
        {RenderMonetaryEditControl(amount, "EUR")}
    </FormField>;
}

function RenderProductsSelection(condition: boolean, productId: DataLink<number>, products: ProductDTO[])
{
    if(!condition)
        return null;

    return<FormField title="Product">
        <Select onChanged={newValue => productId.Set(parseInt(newValue[0]))}>
            {products.map(p => <option value={p.id}>{p.title + " (" + p.price + ")"}</option>)}
        </Select>
    </FormField>;
}

function RenderSubscriptionSelection(condition: boolean, subscriptionId: DataLink<number>, subscriptions: Subscription[])
{
    if(!condition)
        return null;

    return<FormField title="Subscription">
        <Select onChanged={newValue => subscriptionId.Set(parseInt(newValue[0]))}>
            {subscriptions.map(s => <option value={s.id}>{s.name + " (" + s.price + ")"}</option>)}
        </Select>
    </FormField>;
}

function InternalCreateItemComponent(input: { identities: IdentityOverviewData[]; products: ProductDTO[]; subscriptions: Subscription[]; init: ItemInitValues; onCreated: (id: number) => void })
{
    function StateToSaleType(): ItemSaleType
    {
        switch(state.saleType)
        {
            case "other":
                return { type: "manual", amount: state.amount, currency: state.currency };
            case "product":
                return { type: "product", productId: state.productId };
            case "subscription":
                return { type: "subscription", subscriptionId: state.subscriptionId };
        }
    }

    const state = UseState({
        saleDate: input.init.timeStamp,
        debtorId: input.init.debtorId,
        productId: 0,
        subscriptionId: 0,
        saleType: Of<SaleType>((input.init.amount === "0") ? "product" : "other"),
        amount: input.init.amount,
        currency: "EUR",
        note: "",
    });
    const apiState = UseDeferredAPI(
        () => Use(APIService).items.post({
            timestamp: state.saleDate,
            debtorId: state.debtorId,
            note: state.note,
            saleType: StateToSaleType()
        }),
        id => input.onCreated(id)
    );
    
    if(apiState.started)
        return apiState.fallback;

    const isValid = (state.debtorId !== 0) && IsValid(state.saleType, state.productId, state.subscriptionId, state.note);
    return <div className="container">
        <FormField title="Sale date" description="When did the sale take place?">
            <DateTimePicker value={state.saleDate} onChanged={newValue => state.saleDate = newValue} />
        </FormField>
        <FormField title="Debtor" description="Who was this sold to?">
            <Select onChanged={newValue => state.debtorId = parseInt(newValue[0])}>
                {input.identities.map(i => <option selected={state.debtorId === i.id} value={i.id}>{i.firstName + " " + i.lastName}</option>)}
            </Select>
        </FormField>
        <FormField title="Type of sale" description="What was sold?">
            <>
                <RadioButton checked={state.saleType === "product"} onChecked={() => state.saleType = "product"}>Product</RadioButton>
                <RadioButton checked={state.saleType === "subscription"} onChecked={() => state.saleType = "subscription"}>Subscription</RadioButton>
                <RadioButton checked={state.saleType === "other"} onChecked={() => state.saleType = "other"}>Other</RadioButton>
            </>
        </FormField>
        {RenderProductsSelection(state.saleType === "product", state.links.productId, input.products)}
        {RenderSubscriptionSelection(state.saleType === "subscription", state.links.subscriptionId, input.subscriptions)}
        {RenderAmountEdit(state.saleType === "other", state.links.amount)}
        <FormField title="Note" description="Additional notes for this item">
            <TextArea value={state.note} onChanged={newValue => state.note = newValue} />
        </FormField>
        <PushButton color="primary" enabled={isValid} onActivated={apiState.start}>Create</PushButton>
    </div>;
}

function LoadIdentities(input: { products: ProductDTO[]; subscriptions: Subscription[]; init: ItemInitValues; onCreated: (id: number) => void })
{
    const apiState = UseAPI(() => Use(APIService).identities.get(), data => data.SortBy(x => x.firstName));
    return apiState.success ? <InternalCreateItemComponent identities={apiState.data} init={input.init} onCreated={input.onCreated} products={input.products} subscriptions={input.subscriptions} /> : apiState.fallback;
}

function LoadSubscriptions(input: { products: ProductDTO[]; init: ItemInitValues; onCreated: (id: number) => void })
{
    const apiState = UseAPI(() => Use(APIService).subscriptions.get());
    return apiState.success ? <LoadIdentities subscriptions={apiState.data} init={input.init} onCreated={input.onCreated} products={input.products} /> : apiState.fallback;
}

export function CreateItemComponent(input: { init: ItemInitValues; onCreated: (id: number) => void })
{
    const apiState = UseAPI(() => Use(APIService).products.get());
    return apiState.success ? <LoadSubscriptions init={input.init} products={apiState.data} onCreated={input.onCreated} /> : apiState.fallback;
}