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
import 'dotenv/config';
import http from "http";

import { OpenAPI } from "acts-util-core";
import { Factory, GlobalInjector, HTTP } from "acts-util-node";
import { APIRegistry } from "acts-util-apilib";
import { DatabaseController } from "./data-access/DatabaseController";

async function SetupServer()
{
    const requestHandlerChain = Factory.CreateRequestHandlerChain();
    requestHandlerChain.AddCORSHandler([process.env.OPENACCOUNTING_ORIGIN!]);
    requestHandlerChain.AddBodyParser();

    await import("./__http_registry");

    const openAPIDef: OpenAPI.Root = (await import("../dist/openapi.json")) as any;
    const backendStructure: any = await import("../dist/openapi-structure.json");
    requestHandlerChain.AddRequestHandler(new HTTP.RouterRequestHandler(openAPIDef, backendStructure, APIRegistry.endPointTargets));

    const server = http.createServer(requestHandlerChain.requestListener);

    server.listen(process.env.OPENACCOUNTING_PORT, () => {
        console.log("Server is running...");
    });

    process.on('SIGINT', function()
    {
        console.log("Shutting server down...");
        GlobalInjector.Resolve(DatabaseController).Close();
        server.close();
    });
}

SetupServer();