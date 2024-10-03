import React from 'react';
import Banner from './Banner';
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container'
import Table from 'react-bootstrap/Table'

class Calc extends React.Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            basic : 0,
            hra : 0,
            other : 0,
            elss : 0,
            lic : 0,
            phomeloan : 0,
            othereightyc : 0,
            fd : 0,
            rent : 0,
            otherded : 0,
            oldscheme : {
                s1 : 0,
                s2 : 0,
                s3 : 0,
                s4 : 0,
                cess : 0
            },
            newscheme : {
                s1 : 0,
                s2 : 0,
                s3 : 0,
                s4 : 0,
                s5 : 0,
                s6 : 0,
                cess : 0
            }
        }
    }

    componentDidMount()
    {
        let taxstring = localStorage.getItem("com.rvnd.lazytax:taxstate");
        if(taxstring!=null)
        {
            let taxstate = JSON.parse(taxstring);
            this.setState(
                {
                    ...taxstate,
                });
        }
        else localStorage.removeItem("com.rvnd.lazytax:taxstate");
    }

    update(field, value) {
        this.setState(
            {
                ...this.state,
                [field]: value
            });
        localStorage.setItem("com.rvnd.lazytax:taxstate",JSON.stringify({
            ...this.state,
            [field]: value
        }));

    }

    formatIndian(number)
    {
        number = Number(number);
        number = number.toFixed(2);
        var n1, n2;
        let num = number + '' || '';
        // works for integer and floating as well
        n1 = num.split('.');
        n2 = n1[1] || null;
        n1 = n1[0].replace(/(\d)(?=(\d\d)+\d$)/g, "$1,");
        num = n2 ? n1 + '.' + n2 : n1;
        return num;
    }

    getGrossAnnualSalary()
    {
        //return <h5>Annual Gross Salary :<b>₹ {this.formatIndian(Number(this.state.basic) + Number(this.state.hra) + Number(this.state.other))}</b></h5>
        return Number(this.state.basic) + Number(this.state.hra) + Number(this.state.other);
    }

    getEightyCDeductions()
    {
        let num =  Number(this.getEmployeePF() + Number(this.state.elss) + Number(this.state.lic) + Number(this.state.phomeloan) + Number(this.state.othereightyc) + Number(this.state.fd));
        if(num >= 150000) return Number(150000);
        return num;
    }

    getFormattedEightyCDeductions()
    {
        return <h5>Total 80C Deductions :<b>₹ {this.formatIndian(this.getEightyCDeductions()) + " of " + this.formatIndian(150000)}</b></h5> 
    }

    getTotalDeductions()
    {
        //Standard deduction + Prof Tax
        let deduction = 50000 + 2400 + this.getEightyCDeductions() + this.getRentDeduction() + Number(this.state.otherded);
        return deduction;
    }

    getRentDeduction()
    {
        if(this.state.rent===0) return 0;
        let b = (50.0/100.0) * Number(this.state.basic);
        let c = Number(this.state.rent) - ((10.0/100.0) * Number(this.state.basic))
        let ded =  Number(Math.min(this.state.hra, b, c));
        return ded;
    }

    getEmployeePF()
    {
        return Number((12.0/100.0) * this.state.basic);
    }
    
    calculateSlabTax(remaining, slab_range, tax_rate)
    {
       if(remaining > slab_range) return slab_range * (tax_rate/100.0);
       else return remaining * (tax_rate/100.0);
    }

    calculateNewSchemeTax()
    {
        let totaltaxable = this.getGrossAnnualSalary();
    
         //Tax rebate if totaltaxable is 7L or less
         if(totaltaxable <= 700000) totaltaxable = 0

        //Standard Deduction of 50,000
        totaltaxable = totaltaxable - 50000.0

        let slab1 = this.calculateSlabTax(totaltaxable, 300000, 0);
        let rem1 = totaltaxable - 300000;
        if(rem1 <=0) rem1 = 0;

        let slab2 = this.calculateSlabTax(rem1,300000, 5);
        let rem2 = rem1 - 300000;
        if(rem2 <=0) rem2 = 0;

        let slab3= this.calculateSlabTax(rem2,300000, 10);
        let rem3 = rem2 - 300000;
        if(rem3 <=0) rem3 = 0;

        let slab4= this.calculateSlabTax(rem3,300000, 15);
        let rem4 = rem3 - 300000;
        if(rem4 <=0) rem4 = 0;

        let slab5= this.calculateSlabTax(rem4,300000, 20);
        let rem5 = rem4 - 300000;
        if(rem5 <=0) rem5 = 0;

        let slab6 = this.calculateSlabTax(rem5, rem5, 30);
        let cess = (4.0/100.0) * (slab1 + slab2 + slab3 + slab4 + slab5 + slab6);
        let final = {
            's1' : Number(slab1),
            's2' : Number(slab2),
            's3' : Number(slab3),
            's4' : Number(slab4),
            's5' : Number(slab5),
            's6' : Number(slab6),
            'cess' : Number(cess),
            'totaltax' : Number(slab1 + slab2 + slab3 + slab4 + slab5 + slab6 + cess)
        }

        let oldie = JSON.stringify(this.state.newscheme);
        let finaly = JSON.stringify(final);
        
        if(oldie!==finaly)
        {
            this.setState(
                {
                    ...this.state,
                    'newscheme' : final
                });
        }
    }

    calculateOldSchemeTax()
    {
        let totalrebate = 0;
        let totaltaxable = this.getGrossAnnualSalary() - this.getTotalDeductions();

        //Tax rebate upto 12,500 if taxable income is less than or equal 5L
        if(totaltaxable <= 500000) totalrebate = totalrebate + 12500

        if(totaltaxable <=0) totaltaxable = 0
        let slab1 = this.calculateSlabTax(totaltaxable, 250000, 0);
        let rem1 = totaltaxable - 250000;
        if(rem1 <=0) rem1 = 0;

        let slab2 = this.calculateSlabTax(rem1,250000, 5);
        let rem2 = rem1 - 250000;
        if(rem2 <=0) rem2 = 0;

        let slab3= this.calculateSlabTax(rem2,500000, 20);
        let rem3 = rem2 - 500000;
        if(rem3 <=0) rem3 = 0;

        let slab4 = this.calculateSlabTax(rem3, rem3, 30);
        let total_tax = (slab1 + slab2 + slab3 + slab4) - totalrebate;
        if(total_tax <= 0) total_tax = 0
        let cess = (4.0/100.0) * total_tax;
        let final = {
            's1' : Number(slab1),
            's2' : Number(slab2),
            's3' : Number(slab3),
            's4' : Number(slab4),
            'cess' : Number(cess),
            'totaltax' : Number(total_tax + cess)
        }
        let oldie = JSON.stringify(this.state.oldscheme);
        let finaly = JSON.stringify(final);
        
        if(oldie!==finaly)
        {
            this.setState(
                {
                    ...this.state,
                    'oldscheme' : final
                });
        }
    }

    render() 
    {
        
        let gross_annual_salary = <h5>Annual Gross Salary :<b>₹ {this.formatIndian(Number(this.getGrossAnnualSalary()))}</b></h5>;
        let employee_pf = this.getEmployeePF();
        let old_total_deductions = <h5>Total Deductions : <b>₹ {this.formatIndian(Number(this.getTotalDeductions()))}</b></h5> 
        let eightyc = this.getFormattedEightyCDeductions();
        let old_totaltaxable = <h5><b>Total Taxable Income : ₹ {this.formatIndian(Number(this.getGrossAnnualSalary() - this.getTotalDeductions()))}</b></h5>;
        let new_totaltaxable = <h5><b>Total Taxable Income : ₹ {this.formatIndian(Number(this.getGrossAnnualSalary()))}</b></h5>;
        let new_total_deductions = <h5>Total Deductions : <b>₹ {this.formatIndian(Number(50000))}</b></h5> 

        this.calculateOldSchemeTax();
        this.calculateNewSchemeTax();
        return (
            <div>
                <Banner></Banner>
                <Container fluid>
                    <Row>
                        <Col>
                            <Form action="#">
                                <Form.Group controlId="basicSalary">
                                    <Form.Label>Basic Salary</Form.Label>
                                    <Form.Control type="number" placeholder="Annual Basic Salary" value={this.state.basic} onChange={(e)=> {this.update('basic',e.target.value); }} onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Your annual basic salary</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="hra">
                                    <Form.Label>Housing Allowance</Form.Label>
                                    <Form.Control type="number" placeholder="Annual HRA" value={this.state.hra} onChange={(e)=> {this.update('hra',e.target.value)}} onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Annual HRA your company provides</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="otherAllowance">
                                    <Form.Label>Other Allowances/Bonuses</Form.Label>
                                    <Form.Control type="number" placeholder="Other allowances" value={this.state.other} onChange={(e)=> {this.update('other',e.target.value)}}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Add up your other allowances/bonuses provided annually</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col>{gross_annual_salary}</Col>
                    </Row>
                </Container>
                <br/><br/> 
                <Container fluid>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Group controlId="Employee PF">
                                    <Form.Label>Employee PF (80C)</Form.Label>
                                    <Form.Control type="number" value={employee_pf} disabled/>
                                    <Form.Text className="text-muted">Employee PF (12% of BASIC)</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="ELSS">
                                    <Form.Label>ELSS Funds (80C)</Form.Label>
                                    <Form.Control type="number" value={this.state.elss} onChange={(e)=>this.update('elss',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Total invested amount for the year</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="lic">
                                    <Form.Label>Life Insurance (80C)</Form.Label>
                                    <Form.Control type="number" value={this.state.lic} onChange={(e)=>this.update('lic',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Total insurance premium paid for the year</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="pghomeloan">
                                    <Form.Label>Principal Home Loan(80C)</Form.Label>
                                    <Form.Control type="number" value={this.state.phomeloan} onChange={(e)=>this.update('phomeloan',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Principal portion of the EMI paid for home loan</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="fd">
                                    <Form.Label>Tax-Saving FD (80C)</Form.Label>
                                    <Form.Control type="number" value={this.state.fd} onChange={(e)=>this.update('fd',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Total investment in Tax Saving FD for 5y</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="other">
                                    <Form.Label>Other 80C Deductions</Form.Label>
                                    <Form.Control type="number" value={this.state.othereightyc}  onChange={(e)=>this.update('othereightyc',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Total investment in other 80c deductions not declared here</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col>{eightyc}</Col>
                    </Row>
                    <br/><br/>
                    <Row>
                        <Col>
                            <Form>
                                <Form.Group controlId="stdded">
                                    <Form.Label>Standard Deduction</Form.Label>
                                    <Form.Control type="number" value="50000" disabled/>
                                    <Form.Text className="text-muted">Standard deduction offered </Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="proftax">
                                    <Form.Label>Professional Tax</Form.Label>
                                    <Form.Control type="number" value="2400" disabled/>
                                    <Form.Text className="text-muted">Professional Tax (200 per month) </Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="rent">
                                    <Form.Label>House Rent (10 - 13A)</Form.Label>
                                    <Form.Control type="number" value={this.state.rent} onChange={(e)=>this.update('rent',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Yearly rent (Non-metro). Specifiy 0 if not in rented house</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col>
                            <Form>
                                <Form.Group controlId="otherded">
                                    <Form.Label>Other Deductions</Form.Label>
                                    <Form.Control type="number" value={this.state.otherded} onChange={(e)=>this.update('otherded',e.target.value)}  onWheel={(e) => e.target.blur()}/>
                                    <Form.Text className="text-muted">Ex. Meal coupons or ANY other deduction</Form.Text>
                                </Form.Group>
                            </Form>
                        </Col>
                    </Row>
                    <br/>
                </Container>
                
                <br/><br/>
                <hr/>
                <Container fluid>
                <h5 align="left">Tax Calculation (Old Regime)</h5> 
                    {old_totaltaxable}
                    {old_total_deductions}
                    <br/>
                    <Row>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                <th>Slab</th>
                                <th>Tax Rate</th>
                                <th>Tax Payable</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>0 to ₹2,50,000</td>
                                    <td>0%</td>
                                    <td>₹ {this.formatIndian(this.state.oldscheme.s1)}</td>
                                </tr>
                                <tr>
                                    <td>₹2,50,001 to ₹5,00,000	</td>
                                    <td>5%</td>
                                    <td>₹ {this.formatIndian(this.state.oldscheme.s2)}</td>
                                </tr>
                                <tr>
                                    <td>₹5,00,001 to ₹10,00,000</td>
                                    <td>20%</td>
                                    <td>₹ {this.formatIndian(this.state.oldscheme.s3)}</td>
                                </tr>
                                <tr>
                                    <td>Above ₹10,00,000</td>
                                    <td>30%</td>
                                    <td>₹ {this.formatIndian(this.state.oldscheme.s4)}</td>
                                </tr>
                                <tr>
                                    <td>Cess</td>
                                    <td>4% on Tax</td>
                                    <td>₹ {this.formatIndian(this.state.oldscheme.cess)}</td>
                                </tr>
                                <tr>
                                    <th colSpan="2">TOTAL TAX TO BE PAID THIS YEAR</th>
                                    <th>₹ {this.formatIndian(this.state.oldscheme.totaltax)}</th>
                                </tr>
                                <tr>
                                    <th colSpan="2">TOTAL TAX TO BE PAID PER MONTH</th>
                                    <th>₹ {this.formatIndian(this.state.oldscheme.totaltax/12)}</th>
                                </tr>
                            </tbody>
                        </Table>
                    </Row>
                </Container>
                <br/><br/>
                <Container fluid>
                <h5 align="left">Tax Calculation (New Regime)</h5> 
                {new_totaltaxable}
                {new_total_deductions}
                    <br/>
                    <Row>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                <th>Slab</th>
                                <th>Tax Rate</th>
                                <th>Tax Payable</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>0 to ₹3,00,000</td>
                                    <td>0%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s1)}</td>
                                </tr>
                                <tr>
                                    <td>₹3,00,000 to ₹6,00,000	</td>
                                    <td>5%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s2)}</td>
                                </tr>
                                <tr>
                                    <td>₹6,00,001 to ₹9,00,000</td>
                                    <td>10%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s3)}</td>
                                </tr>
                                <tr>
                                    <td>₹9,00,001 to ₹12,00,000</td>
                                    <td>15%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s4)}</td>
                                </tr>
                                <tr>
                                    <td>₹12,00,001 to ₹15,00,000</td>
                                    <td>20%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s5)}</td>
                                </tr>
                                <tr>
                                    <td>Above ₹15,00,000</td>
                                    <td>30%</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.s6)}</td>
                                </tr>
                                <tr>
                                    <td>Cess</td>
                                    <td>4% on Tax</td>
                                    <td>₹ {this.formatIndian(this.state.newscheme.cess)}</td>
                                </tr>
                                <tr>
                                    <th colSpan="2">TOTAL TAX TO BE PAID THIS YEAR</th>
                                    <th>₹ {this.formatIndian(this.state.newscheme.totaltax)}</th>
                                </tr>
                                <tr>
                                    <th colSpan="2">TOTAL TAX TO BE PAID PER MONTH</th>
                                    <th>₹ {this.formatIndian(this.state.newscheme.totaltax/12)}</th>
                                </tr>
                            </tbody>
                        </Table>
                    </Row>
                </Container>
                <br /><br />
            </div>
        )
    }
  }

  export default Calc