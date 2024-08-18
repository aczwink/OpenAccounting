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

import { BootstrapApp, I18nManager, RootInjector } from "acfrontend";
import { RootComponent } from "./RootComponent";
import { routes } from "./routing";

async function SetupLanguages()
{
    const i18n = RootInjector.Resolve(I18nManager);

    i18n.AddLanguage("en", await import("../dist/en.json"));
    i18n.AddLanguage("de", await import("../dist/de.json"), "en");

    i18n.activeLanguage = "de";
}

async function Bootstrap()
{
    await SetupLanguages();

    BootstrapApp({
        mountPoint: document.body,
        rootComponentClass: RootComponent,
        routes: routes,
        title: "OpenAccounting",
        version: "0.1 beta"
    });
}

Bootstrap();