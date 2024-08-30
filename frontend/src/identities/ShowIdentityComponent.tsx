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

import { Anchor, BootstrapIcon, Component, CreateDeferredAPIState, DeferredAPIState, Injectable, JSX_CreateElement, JSX_Fragment, PopupManager, ProgressSpinner, PushButton, RouteParamProperty, TitleService } from "acfrontend";
import { Identity, SubscriptionAssignment } from "../../dist/api";
import { CachedAPIService } from "../CachedAPIService";
import { PaymentServiceComponent } from "../payments/PaymentServiceComponent";
import { AssignSubscriptionComponent } from "./AssignSubscriptionComponent";
import { APIService } from "../APIService";
import { SubscriptionReferenceComponent } from "../subscriptions/SubscriptionReferenceComponent";
import { AddPaymentAccountComponent } from "./AddPaymentAccountComponent";

@Injectable
export class ShowIdentityComponent extends Component
{
    constructor(private cachedAPIService: CachedAPIService, @RouteParamProperty("identityId") private identityId: number, private titleService: TitleService, private popupManager: PopupManager, private apiService: APIService)
    {
        super();

        this.data = null;
        this.loadSubscriptionsState = CreateDeferredAPIState(() => this.apiService.identities._any_.subscriptions.get(this.identityId), this);
    }
    
    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <div className="container">
            <h3>{this.data.firstName} {this.data.lastName} <Anchor route={"/identities/edit/" + this.identityId}><BootstrapIcon>pencil</BootstrapIcon></Anchor></h3>
            <p>{this.data.notes}</p>

            <hr />
            {this.RenderPaymentAccounts()}

            <hr />
            {this.RenderSubscriptions()}
        </div>;
    }

    //Private state
    private data: Identity | null;
    private loadSubscriptionsState: DeferredAPIState<SubscriptionAssignment[]>;

    //Private methods
    private async LoadData()
    {
        this.data = await this.cachedAPIService.RequestIdentity(this.identityId);
        this.titleService.title = this.data.firstName + " " + this.data.lastName;
        
        this.loadSubscriptionsState.start();
    }

    private RenderPaymentAccounts()
    {
        return <>
            <h5>Payment accounts</h5>
            <table className="table table-sm table-striped">
                <thead>
                    <th>Payment service</th>
                    <th>Account</th>
                </thead>
                <tbody>
                    {this.data!.paymentAccounts.map(x => <tr>
                        <td><PaymentServiceComponent paymentServiceId={x.paymentServiceId} /></td>
                        <td>{x.externalAccount}</td>
                    </tr>)}
                </tbody>
            </table>
            <PushButton color="primary" enabled={true} onActivated={this.OnAddPaymentAccount.bind(this)}><BootstrapIcon>plus</BootstrapIcon> Create</PushButton>
        </>;
    }

    private RenderSubscriptionEnd(end: string | null)
    {
        if(end === null)
        {
            return <>
                <i>ongoing</i>
                TODO: ability to terminate
            </>;
        }
        return end;
    }

    private RenderSubscriptions()
    {
        const apiState = this.loadSubscriptionsState;
        return <>
            <h5>Subscriptions</h5>
            {apiState.state.success ? this.RenderSubscriptionsTable(apiState.state.data) : apiState.fallback}
            <PushButton color="primary" enabled={true} onActivated={this.OnAddSubscription.bind(this)}>Assign subscription</PushButton>
        </>;
    }

    private RenderSubscriptionsTable(subscriptions: SubscriptionAssignment[])
    {
        return <table className="table table-sm table-striped">
            <thead>
                <th>Subscription</th>
                <th>Start date</th>
                <th>End date</th>
            </thead>
            <tbody>
                {subscriptions.map(x => <tr>
                    <td><SubscriptionReferenceComponent id={x.subscriptionId} /></td>
                    <td>{x.begin}</td>
                    <td>{this.RenderSubscriptionEnd(x.end)}</td>
                </tr>)}
            </tbody>
        </table>;
    }

    //Event handlers
    private OnAddPaymentAccount()
    {
        const dialogRef = this.popupManager.OpenDialog(<AddPaymentAccountComponent identityId={this.identityId} />, { title: "Add payment account" });
        dialogRef.onClose.Subscribe(this.LoadData.bind(this));
    }

    private OnAddSubscription()
    {
        const dialogRef = this.popupManager.OpenDialog(<AssignSubscriptionComponent identityId={this.identityId} />, { title: "Assign subscription" });
        dialogRef.onClose.Subscribe(this.LoadData.bind(this));
    }
    
    override async OnInitiated(): Promise<void>
    {
        this.LoadData();
    }
}