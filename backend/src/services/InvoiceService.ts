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

import { Injectable } from "acts-util-node";
import html_to_pdf from 'html-pdf-node';
import { LanguageService } from "./LanguageService";

@Injectable
export class InvoiceService
{
    constructor(private languageService: LanguageService)
    {
    }

    //Public methods
    public async GeneratePDFInvoice(year: number, month: number)
    {
        const options = { format: 'A4' };

        const pages = [
            await this.GenerateTitlePage(year, month)
        ];

        const file = {
            content: pages.join("\n")
        };

        return new Promise<Buffer>( (resolve, reject) => {
            html_to_pdf.generatePdf(file, options, (error, pdfBuffer) => {
                if(error)
                    reject(error);
                else
                    resolve(pdfBuffer);
            });
        });
    }

    //Private methods
    private async GenerateTitlePage(year: number, month: number)
    {
        const date = new Date(year, month - 1);
        const lastDayOfMonth = new Date(year, month, 0);
        const lang = await this.languageService.GetBCP47Tag();
        const monthName = date.toLocaleString(lang, { month: 'long' });

        return `
        <h2>Abrechnung</h2>
        <h3>${monthName} ${year}</h3>
        <table>
            <tbody>
                <tr>
                    <th>Stichtag:</th>
                    <td>${lastDayOfMonth.toLocaleDateString(lang)}</td>
                </tr>
                <tr>
                    <th>Summe Abonnements:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Summe Verkäufe:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Umsatz:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Sonstige Einnahmen:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Summe Einnahmen:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Ausgaben:</th>
                    <td>TODO</td>
                </tr>
                <tr>
                    <th>Saldo:</th>
                    <td>TODO</td>
                </tr>
            </tbody>
        </table>
        <p>Ich bestätige die Abrechnung nach bestem Wissen und Gewissen erstellt zu haben.</p>
        <p>
        ______________________
        Unterschrift Ersteller
        </p>
        <p>
        ______________________
        Unterschrift Kassenwart
        </p>
        `;
    }
}