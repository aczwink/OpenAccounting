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

import { BootstrapIcon, FormField, JSX_CreateElement, JSX_Fragment, LineEdit, PushButton, Router, TextArea, Use, UseDeferredAPI, UseState } from "acfrontend";
import { IdentityCreationData } from "../../dist/api";
import { APIResponse } from "acfrontend/dist/RenderHelpers";

export function IdentityFormComponent(input: { init: IdentityCreationData; provideIdentityId: () => number; saveAPI: (data: IdentityCreationData) => Promise<APIResponse<void | number>> })
{
    const state = UseState({
        firstName: input.init.firstName,
        lastName: input.init.lastName,
        notes: input.init.notes,
    });
    const apiState = UseDeferredAPI(
        () => input.saveAPI({ firstName: state.firstName, lastName: state.lastName, notes: state.notes }),
        () => Use(Router).RouteTo("/identities/" + input.provideIdentityId())
    );

    if(apiState.started)
        return apiState.fallback;

    const isValid = (state.firstName.trim().length > 0) && (state.lastName.trim().length > 0);
    return <>
        <FormField title="First name">
            <LineEdit link={state.links.firstName} />
        </FormField>
        <FormField title="Last name">
            <LineEdit link={state.links.lastName} />
        </FormField>
        <FormField title="Notes" description="Any additional notes to be memorized">
            <TextArea onChanged={newValue => state.notes = newValue} value={state.notes} />
        </FormField>
        <PushButton color="primary" enabled={isValid} onActivated={apiState.start}><BootstrapIcon>floppy</BootstrapIcon> Save</PushButton>
    </>;
}