import { AgGridReact } from 'ag-grid-react'; // AG Grid Component
import {useEffect, useRef, useState} from "react";
import axios from "axios";

const InventoryTable = () => {
    const [rowData, setRowData] = useState([]);
    const gridRef = useRef();
    const [colDefs, setColDefs] = useState([
        { field: "item" },
        { field: "quantity" },
        {
            headerName: '',
            checkboxSelection: true,
            width: 50,
            field: 'checkboxBtn'
        }
    ]);

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3000/inventory')
            const jsonData = await response.data
            setRowData(jsonData)
        } catch (error) {
            console.error('Error in fetching data: ', error)
        }
    }

    const handleDelete = async () => {
        const deleteItemId = gridRef.current?.api.getSelectedRows()[0].id
        await axios.delete(`http://localhost:3000/inventory/${deleteItemId}`)
        await fetchData()
    }


    return (
     <div
         className="ag-theme-quartz"
         style={{ height: 500 }}
     >
         <button onClick={handleDelete}>Delete Item</button>
         <AgGridReact
             rowData={rowData}
             columnDefs={colDefs}
             ref={gridRef}
         />
     </div>
 )
}

export default InventoryTable