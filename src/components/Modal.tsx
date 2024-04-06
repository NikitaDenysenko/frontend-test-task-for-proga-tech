import {useState} from "react";

const Modal = ({ isVisible, onClose, onSubmit }) => {
    const [item, setItem] = useState()
    const [quantity, setQuantity] = useState()

    const onItemChange = (event) => {
        setItem(event.target.value)
    }

    const onQuantityChange = (event) => {
        setQuantity(event.target.value)
    }

    if(!isVisible) {
        return null
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center'>
            <div className='w-[600px]'>
                <div className='bg-white p-2 rounded'>
                    <div className='p-6 flex flex-col '>
                        <button className='text-gray-900text-xl place-self-end ' onClick={onClose}>X</button>
                        <h3 className='text-xl font-semibold text-gray-900 mb-5'>
                            Create New Item
                        </h3>
                        <form className='spcae-y-6' action='#'>
                            <div className='mb-4'>
                                <label htmlFor='item' className='block mb-2 text-sm font-medium text-gray-900'>
                                    Item
                                </label>
                                <input
                                   name='item'
                                   id='item'
                                   className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                                   focus:border-blue-500 block w-full p-2.5'
                                   placeholder='item'
                                   onChange={onItemChange}
                                />
                            </div>
                            <div className='mb-4'>
                                <label htmlFor='quantity' className='block mb-2 text-sm font-medium text-gray-900'>
                                    Quantity
                                </label>
                                <input
                                    name='quantity'
                                    id='quantity'
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500
                                   focus:border-blue-500 block w-full p-2.5'
                                    placeholder='quantity'
                                    onChange={onQuantityChange}
                                />
                            </div>
                        </form>
                        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded' onClick={() => onSubmit(item, quantity)}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal