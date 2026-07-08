import useTable from '@hooks/table/useTable.jsx';

export default function Table({ data, columns, filter, dataToFilter, initialSortName, onSelectionChange, buttonCallbacksRef, layout }) {
  const { tableRef } = useTable({ data, columns, filter, dataToFilter, initialSortName, onSelectionChange, externalButtonCallbacksRef: buttonCallbacksRef, layout });

  return (
    <div className='table-container'>
      <div ref={tableRef}></div>
    </div>
  );
}