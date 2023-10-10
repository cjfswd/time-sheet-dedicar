"use client"
import React, { useState } from 'react';
import { Document, Page, Text, View, StyleSheet, Font, PDFViewer, BlobProvider } from '@react-pdf/renderer';
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link';
import { cn } from '../../lib/utils';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from '@/components/ui/checkbox';
import { useIsClient } from "@uidotdev/usehooks";
import { useLocalStorage } from "@uidotdev/usehooks";


// Importe uma fonte que deseja usar no PDF
// Font.register({ family: 'Arial', src: 'https://fonts.gstatic.com/s/arial/v15/tssv-0t9qAsmVcPqXSbI5jZ6MT4.woff2' });

const styles = StyleSheet.create({
    page: {
        padding: 20,
    },
    header: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    table: {
        width: '100%',
        border: '1px solid #000',
        fontSize: 10,
    },
    row: {
        flexDirection: 'row',
    },
    day: {
        width: '5%',
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
        padding: 5,
        textAlign: 'center',
    },
    cell: {
        flex: 1,
        borderRight: '1px solid #000',
        borderBottom: '1px solid #000',
        padding: 5,
        textAlign: 'center',
    },
    headerCell: {
        backgroundColor: '#f0f0f0',
    },
});

const PontoPDF = ({ funcionarios, mes }: { funcionarios: string[], mes: Date }) => {
    const time = mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    const capitalized =
        time.charAt(0).toUpperCase()
        + time.slice(1)
    return (
        <Document>
            {funcionarios.map((funcionario, index) => (
                <Page key={index} size="A4" style={styles.page}>
                    <Text style={styles.header}>
                        Folha de Ponto - {capitalized}
                    </Text>
                    <Text style={styles.header}>Funcionário: {funcionario}</Text>
                    <View style={styles.table}>
                        <View style={styles.row}>
                            <Text style={styles.day}>Dia</Text>
                            <Text style={styles.cell}>Assinatura</Text>
                        </View>
                        {Array(31)
                            .fill(null)
                            .map((_, day) => (
                                <View key={day} style={styles.row}>
                                    <Text style={styles.day}>{day + 1}</Text>
                                    <Text style={styles.cell}></Text>
                                </View>
                            ))}
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export const App = () => {
    const isClient = useIsClient();
    const [inputedEmployeeName, setInputedEmployeeName] = useState('');
    const [employeeNameDatabase, setEmployeeNameDatabase] = useLocalStorage<string[]>("employeeNameDatabase", []);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [inputedYear, setInputedYear] = useState(new Date().getFullYear().toString());
    const months = [
        'Janeiro',
        'Fevereiro',
        'Março',
        'Abril',
        'Maio',
        'Junho',
        'Julho',
        'Agosto',
        'Setembro',
        'Outubro',
        'Novembro',
        'Dezembro',
    ];

    return (<div className="w-full flex flex-col gap-4">
        <Card>
            <CardHeader className='space-y-[0px]'>
                <CardTitle className='text-xl'>Formulário de cadastro de nome de funcionário</CardTitle>
                <CardDescription>digite o nome como ele deve aparecer no documento (folha de ponto)</CardDescription>
            </CardHeader>
            <CardContent className="w-full flex flex-col gap-2">
                <Input placeholder='Nome do funcionário' value={inputedEmployeeName} onChange={(e) => setInputedEmployeeName(e.target.value)} />
                <Button className='w-full' onClick={() => {
                    if (inputedEmployeeName != '' && isClient) {
                        const copy = [...employeeNameDatabase]
                        copy.push(inputedEmployeeName)
                        setEmployeeNameDatabase(copy)
                    }
                }}>adicionar nome de funcionário ao banco de dados</Button>
            </CardContent>
        </Card>
        <hr />
        <Card>
            <CardHeader className='space-y-[0px]'>
                <CardTitle className='text-xl'>Seleção de data da folha de ponto</CardTitle>
                <CardDescription>escolha o mês e ano do documento (folha de ponto)</CardDescription>
            </CardHeader>
            <CardContent className="w-full flex flex-row gap-2">
                <div>
                    <Label>Mês</Label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger>
                            <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map((month, index) => <><SelectItem value={index.toString()}>{month}</SelectItem></>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label>Ano</Label>
                    <Input value={inputedYear} onChange={(e) => setInputedYear(e.target.value)} className='w-[65px]' />
                </div>
            </CardContent>
        </Card>
        <hr />
        <Card>
            <CardHeader className='space-y-[0px]'>
                <CardTitle className='text-xl'>Seleção de funcionários para gerar folha de ponto</CardTitle>
                <CardDescription>escolha apenas os funcionários que deseja adicionar no próximo documento (folha de ponto)</CardDescription>
            </CardHeader>
            <CardContent>
                {isClient && employeeNameDatabase.map((item, index) => <div key={index} className='flex flex-row gap-2 items-center' >
                    <Checkbox />
                    <span className='w-full'>{item}</span>
                    <Button className='w-fit whitespace-nowrap' onClick={() => {
                        const copy = [...employeeNameDatabase]
                        copy.splice(index, 1)
                        setEmployeeNameDatabase(copy)
                    }}>excluir do banco de dados</Button></div>)}
            </CardContent>
        </Card>
        <hr />
        {isClient && <BlobProvider document={<PontoPDF funcionarios={employeeNameDatabase} mes={new Date(Number(inputedYear), Number(selectedMonth))} />}>
            {({ blob, url, loading, error }) => {
                let result
                if (loading) result = '...carregando'
                if (error != null) result = 'error'
                if (url != null) result = <Link href={url} target='_blank' className={cn(buttonVariants())}>ver documento</Link>
                return result
            }}
        </BlobProvider>}
    </div>
    );
};
