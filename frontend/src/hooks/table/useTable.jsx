import { useEffect, useRef, useState } from 'react';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import "tabulator-tables/dist/css/tabulator.min.css";
import '@styles/table.css';

function useTable({ data, columns, filter, dataToFilter, initialSortName, onSelectionChange, onActionClick, onButtonClick, externalButtonCallbacksRef }) {
    const tableRef = useRef(null);
    const [table, setTable] = useState(null);
    const [isTableBuilt, setIsTableBuilt] = useState(false);
    const internalButtonCallbacksRef = useRef({});
    const buttonCallbacksRef = externalButtonCallbacksRef || internalButtonCallbacksRef;

    useEffect(() => {
        if (tableRef.current) {
            const mappedColumns = columns.map(col => ({
                ...col,
                title: col.label || col.title,
                field: col.key || col.field,
                formatter: col.key === 'acciones' ? 'html' : col.formatter
            }));

            const updatedColumns = [
                { 
                    formatter: "rowSelection", 
                    titleFormatter: false, 
                    hozAlign: "center", 
                    headerSort: false, 
                    width: 40,
                    cellClick: function (e, cell) {
                        cell.getRow().toggleSelect();
                    } 
                },
                ...mappedColumns
            ];

            const tabulatorTable = new Tabulator(tableRef.current, {
                data: [],
                columns: updatedColumns,
                layout: "fitColumns",
                pagination: "local",
                paginationSize: 6,
                selectableRows: 1,
                rowHeight: 46,
                minHeight: 100,
                langs: {
                    "default": {
                        "pagination": {
                            "first": "Primero",
                            "prev": "Anterior",
                            "next": "Siguiente",
                            "last": "Último",
                        }
                    }
                },
                initialSort: [
                    { column: initialSortName, dir: "asc" }
                ],
            });

            tabulatorTable.on("rowSelectionChanged", function(selectedData) {
                if (onSelectionChange) {
                    onSelectionChange(selectedData);
                }
            });

            tabulatorTable.on("tableBuilt", function() {
                setIsTableBuilt(true);
            });

            // Agregar delegador de eventos para botones
            const handleButtonClick = (e) => {
                const button = e.target.closest('button');
                if (button) {
                    const buttonId = button.id;
                    if (buttonCallbacksRef.current[buttonId]) {
                        buttonCallbacksRef.current[buttonId]();
                    }
                }
            };

            if (tableRef.current) {
                tableRef.current.addEventListener('click', handleButtonClick);
            }

            setTable(tabulatorTable);

            return () => {
                if (tableRef.current) {
                    tableRef.current.removeEventListener('click', handleButtonClick);
                }
                tabulatorTable.destroy();
                setIsTableBuilt(false);
                setTable(null);
            };
        }
    }, [columns]);

    useEffect(() => {
        if (table && isTableBuilt && Array.isArray(data)) {
            table.replaceData(data);
        }
    }, [data, table, isTableBuilt]);

    useEffect(() => {
        if (table && isTableBuilt) {
            if (filter) {
                table.setFilter(dataToFilter, "like", filter);
            } else {
                table.clearFilter();
            }
            table.redraw();
        }
    }, [filter, table, dataToFilter, isTableBuilt]);

    return { tableRef, buttonCallbacksRef };
}
export default useTable;