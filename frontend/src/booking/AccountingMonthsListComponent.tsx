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

import { BootstrapIcon, JSX_CreateElement, RouterButton, Use, JSX_Fragment, UseAPI, PushButton, UseDeferredAPI, UseEffectOnce } from "acfrontend";
import { APIService } from "../APIService";
import { AccountingMonth } from "../../dist/api";

function RenderLockAction(m: AccountingMonth, onSetLock: (m: AccountingMonth, locked: boolean) => void)
{
    if(m.isOpen)
    {
        return <PushButton color="primary" enabled onActivated={() => onSetLock(m, true)}>
            <BootstrapIcon>lock</BootstrapIcon>
            Lock
        </PushButton>;
    }

    return <PushButton color="danger" enabled onActivated={() => onSetLock(m, false)}>
        <BootstrapIcon>unlock</BootstrapIcon>
        Unlock
    </PushButton>;
}

function RenderStatus(m: AccountingMonth)
{
    if(m.isOpen)
    {
        return <>
            <BootstrapIcon>unlock</BootstrapIcon>
            Open
        </>;
    }

    return <>
        <BootstrapIcon>lock</BootstrapIcon>
        Locked
    </>;
}

function AccountingMonthsTable(input: { accountingMonths: AccountingMonth[]; onSetLock: (m: AccountingMonth, locked: boolean) => void })
{
    return <div className="row justify-content-center">
        <div className="col-2">
            <table className="table table-sm table-striped">
                <thead>
                    <th>Year</th>
                    <th>Month</th>
                    <th>Status</th>
                    <th>Actions</th>
                </thead>
                <tbody>
                    {input.accountingMonths.map(x => <tr>
                        <td>{x.year}</td>
                        <td>{x.month}</td>
                        <td>{RenderStatus(x)}</td>
                        <td>{RenderLockAction(x, input.onSetLock)}</td>
                    </tr>)}
                </tbody>
                <caption>Showing {input.accountingMonths.length} accounting months.</caption>
            </table>
        </div>
    </div>;
}

export function AccountingMonthsListComponent()
{
    async function setLock(m: AccountingMonth, locked: boolean)
    {
        //todo add deferred api handler that accepts the args, so that errors are also shown
        await Use(APIService).accounting.years._any_.months._any_.put(m.year, m.month, { locked });
        apiState.start();
    }
    const apiState = UseDeferredAPI(() => Use(APIService).accounting.get());
    UseEffectOnce(() => apiState.start())

    return <div className="container">
        {apiState.success ? <AccountingMonthsTable accountingMonths={apiState.data} onSetLock={setLock} /> : apiState.fallback}
        <RouterButton color="primary" route="/booking/accountingmonths/create"><BootstrapIcon>plus</BootstrapIcon> Create</RouterButton>
    </div>;
}