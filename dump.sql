--
-- PostgreSQL database dump
--

\restrict xZx7BU5eetZKd6vgNBNkywdvtTPS582emTdjEQjKeYWUzoQWdCrb3aPk0MrPuDt

-- Dumped from database version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: address; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.address (
    address_id integer NOT NULL,
    street character varying(255),
    barangay character varying(255),
    city character varying(255),
    province character varying(255),
    postal_code integer
);


ALTER TABLE public.address OWNER TO postgres;

--
-- Name: address_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.address_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.address_address_id_seq OWNER TO postgres;

--
-- Name: address_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.address_address_id_seq OWNED BY public.address.address_id;


--
-- Name: assignment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assignment (
    assignment_id integer NOT NULL,
    personnel_id integer,
    contract_id integer,
    assignment_start date,
    assignment_end date,
    status_id integer,
    salary_id integer
);


ALTER TABLE public.assignment OWNER TO postgres;

--
-- Name: assignment_assignment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assignment_assignment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignment_assignment_id_seq OWNER TO postgres;

--
-- Name: assignment_assignment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assignment_assignment_id_seq OWNED BY public.assignment.assignment_id;


--
-- Name: civilstatus; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.civilstatus (
    civilstatus_id integer NOT NULL,
    title character varying(50)
);


ALTER TABLE public.civilstatus OWNER TO postgres;

--
-- Name: client; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client (
    client_id integer NOT NULL,
    client_name character varying(255),
    clienttype_id integer,
    address_id integer,
    contact_person character varying(255),
    contact_number integer,
    email character varying(255)
);


ALTER TABLE public.client OWNER TO postgres;

--
-- Name: client_client_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.client_client_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.client_client_id_seq OWNER TO postgres;

--
-- Name: client_client_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.client_client_id_seq OWNED BY public.client.client_id;


--
-- Name: clienttype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clienttype (
    clienttype_id integer NOT NULL,
    business_type character varying(255)
);


ALTER TABLE public.clienttype OWNER TO postgres;

--
-- Name: contract; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contract (
    contract_id integer NOT NULL,
    client_id integer,
    start_date date,
    end_date date,
    paymenttype_id integer,
    status_id integer,
    contract_value integer
);


ALTER TABLE public.contract OWNER TO postgres;

--
-- Name: contract_contract_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.contract_contract_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.contract_contract_id_seq OWNER TO postgres;

--
-- Name: contract_contract_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.contract_contract_id_seq OWNED BY public.contract.contract_id;


--
-- Name: deductions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deductions (
    deduction_id integer NOT NULL,
    deduction_type character varying(255)
);


ALTER TABLE public.deductions OWNER TO postgres;

--
-- Name: gender; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gender (
    gender_id integer NOT NULL,
    gender_name character varying(50)
);


ALTER TABLE public.gender OWNER TO postgres;

--
-- Name: grosssalary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grosssalary (
    grosstype_id integer,
    amount real,
    personnel_id integer NOT NULL
);


ALTER TABLE public.grosssalary OWNER TO postgres;

--
-- Name: grosstype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.grosstype (
    grosstype_id integer NOT NULL,
    grosstype_name character varying(255)
);


ALTER TABLE public.grosstype OWNER TO postgres;

--
-- Name: paymenttype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.paymenttype (
    paymenttype_id integer NOT NULL,
    type character varying(255)
);


ALTER TABLE public.paymenttype OWNER TO postgres;

--
-- Name: payrollperiod; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payrollperiod (
    pay_id integer NOT NULL,
    date_start date,
    date_end date,
    personnel_id integer
);


ALTER TABLE public.payrollperiod OWNER TO postgres;

--
-- Name: payrollperiod_pay_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payrollperiod_pay_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payrollperiod_pay_id_seq OWNER TO postgres;

--
-- Name: payrollperiod_pay_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payrollperiod_pay_id_seq OWNED BY public.payrollperiod.pay_id;


--
-- Name: personnel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnel (
    personnel_id integer NOT NULL,
    personnel_name character varying(255),
    personnel_age integer,
    civilstatus_id integer,
    gender_id integer,
    address_id integer,
    contact_no character varying(15),
    email character varying(255),
    assignment_id integer
);


ALTER TABLE public.personnel OWNER TO postgres;

--
-- Name: personnel_deductions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnel_deductions (
    deduct_id integer NOT NULL,
    personnel_id integer,
    deduction_id integer,
    account_no integer,
    contribution_amount real
);


ALTER TABLE public.personnel_deductions OWNER TO postgres;

--
-- Name: personnel_deductions_deduct_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personnel_deductions_deduct_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personnel_deductions_deduct_id_seq OWNER TO postgres;

--
-- Name: personnel_deductions_deduct_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personnel_deductions_deduct_id_seq OWNED BY public.personnel_deductions.deduct_id;


--
-- Name: personnel_personnel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personnel_personnel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personnel_personnel_id_seq OWNER TO postgres;

--
-- Name: personnel_personnel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personnel_personnel_id_seq OWNED BY public.personnel.personnel_id;


--
-- Name: personnelgross; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnelgross (
    salary_id integer,
    grosstype_id integer,
    amount real
);


ALTER TABLE public.personnelgross OWNER TO postgres;

--
-- Name: personnelsalary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnelsalary (
    personnel_id integer NOT NULL,
    base_salary numeric(10,2) NOT NULL,
    base_bonus numeric(10,2) DEFAULT 5000.00 NOT NULL,
    base_allowance numeric(10,2) DEFAULT 3000.00 NOT NULL
);


ALTER TABLE public.personnelsalary OWNER TO postgres;

--
-- Name: salary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary (
    salary_id integer NOT NULL,
    personnel_id integer,
    total_deductions integer,
    total_gross integer,
    net_gross integer
);


ALTER TABLE public.salary OWNER TO postgres;

--
-- Name: salary_salary_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_salary_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_salary_id_seq OWNER TO postgres;

--
-- Name: salary_salary_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_salary_id_seq OWNED BY public.salary.salary_id;


--
-- Name: salarydeductions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salarydeductions (
    salary_id integer,
    deduct_id integer,
    amount real
);


ALTER TABLE public.salarydeductions OWNER TO postgres;

--
-- Name: status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status (
    status_id integer NOT NULL,
    status_name character varying(50)
);


ALTER TABLE public.status OWNER TO postgres;

--
-- Name: status_status_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.status_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.status_status_id_seq OWNER TO postgres;

--
-- Name: status_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.status_status_id_seq OWNED BY public.status.status_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: address address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address ALTER COLUMN address_id SET DEFAULT nextval('public.address_address_id_seq'::regclass);


--
-- Name: assignment assignment_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment ALTER COLUMN assignment_id SET DEFAULT nextval('public.assignment_assignment_id_seq'::regclass);


--
-- Name: client client_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client ALTER COLUMN client_id SET DEFAULT nextval('public.client_client_id_seq'::regclass);


--
-- Name: contract contract_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract ALTER COLUMN contract_id SET DEFAULT nextval('public.contract_contract_id_seq'::regclass);


--
-- Name: payrollperiod pay_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrollperiod ALTER COLUMN pay_id SET DEFAULT nextval('public.payrollperiod_pay_id_seq'::regclass);


--
-- Name: personnel personnel_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel ALTER COLUMN personnel_id SET DEFAULT nextval('public.personnel_personnel_id_seq'::regclass);


--
-- Name: personnel_deductions deduct_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_deductions ALTER COLUMN deduct_id SET DEFAULT nextval('public.personnel_deductions_deduct_id_seq'::regclass);


--
-- Name: salary salary_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary ALTER COLUMN salary_id SET DEFAULT nextval('public.salary_salary_id_seq'::regclass);


--
-- Name: status status_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status ALTER COLUMN status_id SET DEFAULT nextval('public.status_status_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: address; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.address (address_id, street, barangay, city, province, postal_code) FROM stdin;
\.


--
-- Data for Name: assignment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assignment (assignment_id, personnel_id, contract_id, assignment_start, assignment_end, status_id, salary_id) FROM stdin;
\.


--
-- Data for Name: civilstatus; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.civilstatus (civilstatus_id, title) FROM stdin;
\.


--
-- Data for Name: client; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.client (client_id, client_name, clienttype_id, address_id, contact_person, contact_number, email) FROM stdin;
\.


--
-- Data for Name: clienttype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clienttype (clienttype_id, business_type) FROM stdin;
\.


--
-- Data for Name: contract; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.contract (contract_id, client_id, start_date, end_date, paymenttype_id, status_id, contract_value) FROM stdin;
\.


--
-- Data for Name: deductions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deductions (deduction_id, deduction_type) FROM stdin;
\.


--
-- Data for Name: gender; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gender (gender_id, gender_name) FROM stdin;
\.


--
-- Data for Name: grosssalary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grosssalary (grosstype_id, amount, personnel_id) FROM stdin;
\.


--
-- Data for Name: grosstype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.grosstype (grosstype_id, grosstype_name) FROM stdin;
\.


--
-- Data for Name: paymenttype; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.paymenttype (paymenttype_id, type) FROM stdin;
\.


--
-- Data for Name: payrollperiod; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payrollperiod (pay_id, date_start, date_end, personnel_id) FROM stdin;
\.


--
-- Data for Name: personnel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel (personnel_id, personnel_name, personnel_age, civilstatus_id, gender_id, address_id, contact_no, email, assignment_id) FROM stdin;
\.


--
-- Data for Name: personnel_deductions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel_deductions (deduct_id, personnel_id, deduction_id, account_no, contribution_amount) FROM stdin;
\.


--
-- Data for Name: personnelgross; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnelgross (salary_id, grosstype_id, amount) FROM stdin;
\.


--
-- Data for Name: personnelsalary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnelsalary (personnel_id, base_salary, base_bonus, base_allowance) FROM stdin;
\.


--
-- Data for Name: salary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary (salary_id, personnel_id, total_deductions, total_gross, net_gross) FROM stdin;
\.


--
-- Data for Name: salarydeductions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salarydeductions (salary_id, deduct_id, amount) FROM stdin;
\.


--
-- Data for Name: status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.status (status_id, status_name) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, email, password_hash) FROM stdin;
1	adminabbie	admin123
\.


--
-- Name: address_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.address_address_id_seq', 1, false);


--
-- Name: assignment_assignment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assignment_assignment_id_seq', 1, false);


--
-- Name: client_client_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.client_client_id_seq', 1, false);


--
-- Name: contract_contract_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.contract_contract_id_seq', 1, false);


--
-- Name: payrollperiod_pay_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payrollperiod_pay_id_seq', 1, false);


--
-- Name: personnel_deductions_deduct_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_deductions_deduct_id_seq', 1, false);


--
-- Name: personnel_personnel_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_personnel_id_seq', 1, false);


--
-- Name: salary_salary_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_salary_id_seq', 1, false);


--
-- Name: status_status_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.status_status_id_seq', 1, false);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 1, true);


--
-- Name: address address_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.address
    ADD CONSTRAINT address_pkey PRIMARY KEY (address_id);


--
-- Name: assignment assignment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT assignment_pkey PRIMARY KEY (assignment_id);


--
-- Name: civilstatus civilstatus_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.civilstatus
    ADD CONSTRAINT civilstatus_pkey PRIMARY KEY (civilstatus_id);


--
-- Name: client client_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT client_pkey PRIMARY KEY (client_id);


--
-- Name: clienttype clienttype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clienttype
    ADD CONSTRAINT clienttype_pkey PRIMARY KEY (clienttype_id);


--
-- Name: contract contract_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT contract_pkey PRIMARY KEY (contract_id);


--
-- Name: deductions deductions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deductions
    ADD CONSTRAINT deductions_pkey PRIMARY KEY (deduction_id);


--
-- Name: gender gender_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gender
    ADD CONSTRAINT gender_pkey PRIMARY KEY (gender_id);


--
-- Name: grosstype grosstype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grosstype
    ADD CONSTRAINT grosstype_pkey PRIMARY KEY (grosstype_id);


--
-- Name: paymenttype paymenttype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.paymenttype
    ADD CONSTRAINT paymenttype_pkey PRIMARY KEY (paymenttype_id);


--
-- Name: payrollperiod payrollperiod_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrollperiod
    ADD CONSTRAINT payrollperiod_pkey PRIMARY KEY (pay_id);


--
-- Name: personnel_deductions personnel_deductions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_deductions
    ADD CONSTRAINT personnel_deductions_pkey PRIMARY KEY (deduct_id);


--
-- Name: personnel personnel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT personnel_pkey PRIMARY KEY (personnel_id);


--
-- Name: personnelsalary personnelsalary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnelsalary
    ADD CONSTRAINT personnelsalary_pkey PRIMARY KEY (personnel_id);


--
-- Name: salary salary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary
    ADD CONSTRAINT salary_pkey PRIMARY KEY (salary_id);


--
-- Name: status status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status
    ADD CONSTRAINT status_pkey PRIMARY KEY (status_id);


--
-- Name: users unique_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- Name: personnel unique_personnel_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT unique_personnel_name UNIQUE (personnel_name);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: idx_assignment_contract; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_contract ON public.assignment USING btree (contract_id);


--
-- Name: idx_assignment_personnel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_personnel ON public.assignment USING btree (personnel_id);


--
-- Name: idx_assignment_salary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_salary ON public.assignment USING btree (salary_id);


--
-- Name: idx_assignment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assignment_status ON public.assignment USING btree (status_id);


--
-- Name: idx_client_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_address ON public.client USING btree (address_id);


--
-- Name: idx_client_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_type ON public.client USING btree (clienttype_id);


--
-- Name: idx_contract_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contract_client ON public.contract USING btree (client_id);


--
-- Name: idx_contract_payment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contract_payment ON public.contract USING btree (paymenttype_id);


--
-- Name: idx_contract_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contract_status ON public.contract USING btree (status_id);


--
-- Name: idx_grosssalary_personnel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grosssalary_personnel ON public.grosssalary USING btree (personnel_id);


--
-- Name: idx_grosssalary_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_grosssalary_type ON public.grosssalary USING btree (grosstype_id);


--
-- Name: idx_payroll_personnel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payroll_personnel ON public.payrollperiod USING btree (personnel_id);


--
-- Name: idx_personnel_address; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnel_address ON public.personnel USING btree (address_id);


--
-- Name: idx_personnel_assignment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnel_assignment ON public.personnel USING btree (assignment_id);


--
-- Name: idx_personnel_civil; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnel_civil ON public.personnel USING btree (civilstatus_id);


--
-- Name: idx_personnel_gender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnel_gender ON public.personnel USING btree (gender_id);


--
-- Name: idx_personneldeduct_deduction; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personneldeduct_deduction ON public.personnel_deductions USING btree (deduction_id);


--
-- Name: idx_personneldeduct_personnel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personneldeduct_personnel ON public.personnel_deductions USING btree (personnel_id);


--
-- Name: idx_personnelgross_salary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnelgross_salary ON public.personnelgross USING btree (salary_id);


--
-- Name: idx_personnelgross_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_personnelgross_type ON public.personnelgross USING btree (grosstype_id);


--
-- Name: idx_salary_personnel; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salary_personnel ON public.salary USING btree (personnel_id);


--
-- Name: idx_salarydeduct_deduct; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salarydeduct_deduct ON public.salarydeductions USING btree (deduct_id);


--
-- Name: idx_salarydeduct_salary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salarydeduct_salary ON public.salarydeductions USING btree (salary_id);


--
-- Name: assignment fk_assignment_contract; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fk_assignment_contract FOREIGN KEY (contract_id) REFERENCES public.contract(contract_id);


--
-- Name: assignment fk_assignment_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fk_assignment_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: assignment fk_assignment_salary; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fk_assignment_salary FOREIGN KEY (salary_id) REFERENCES public.salary(salary_id);


--
-- Name: assignment fk_assignment_status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assignment
    ADD CONSTRAINT fk_assignment_status FOREIGN KEY (status_id) REFERENCES public.status(status_id);


--
-- Name: client fk_client_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT fk_client_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: client fk_client_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client
    ADD CONSTRAINT fk_client_type FOREIGN KEY (clienttype_id) REFERENCES public.clienttype(clienttype_id);


--
-- Name: contract fk_contract_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT fk_contract_client FOREIGN KEY (client_id) REFERENCES public.client(client_id);


--
-- Name: contract fk_contract_payment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT fk_contract_payment FOREIGN KEY (paymenttype_id) REFERENCES public.paymenttype(paymenttype_id);


--
-- Name: contract fk_contract_status; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contract
    ADD CONSTRAINT fk_contract_status FOREIGN KEY (status_id) REFERENCES public.status(status_id);


--
-- Name: grosssalary fk_grosssalary_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grosssalary
    ADD CONSTRAINT fk_grosssalary_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: grosssalary fk_grosssalary_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.grosssalary
    ADD CONSTRAINT fk_grosssalary_type FOREIGN KEY (grosstype_id) REFERENCES public.grosstype(grosstype_id);


--
-- Name: payrollperiod fk_payroll_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payrollperiod
    ADD CONSTRAINT fk_payroll_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: personnel_deductions fk_pdeduct_deduction; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_deductions
    ADD CONSTRAINT fk_pdeduct_deduction FOREIGN KEY (deduction_id) REFERENCES public.deductions(deduction_id);


--
-- Name: personnel_deductions fk_pdeduct_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_deductions
    ADD CONSTRAINT fk_pdeduct_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: personnel fk_personnel_address; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT fk_personnel_address FOREIGN KEY (address_id) REFERENCES public.address(address_id);


--
-- Name: personnel fk_personnel_assignment; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT fk_personnel_assignment FOREIGN KEY (assignment_id) REFERENCES public.assignment(assignment_id);


--
-- Name: personnel fk_personnel_civil; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT fk_personnel_civil FOREIGN KEY (civilstatus_id) REFERENCES public.civilstatus(civilstatus_id);


--
-- Name: personnel fk_personnel_gender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel
    ADD CONSTRAINT fk_personnel_gender FOREIGN KEY (gender_id) REFERENCES public.gender(gender_id);


--
-- Name: personnelgross fk_pgross_salary; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnelgross
    ADD CONSTRAINT fk_pgross_salary FOREIGN KEY (salary_id) REFERENCES public.salary(salary_id) ON DELETE CASCADE;


--
-- Name: personnelgross fk_pgross_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnelgross
    ADD CONSTRAINT fk_pgross_type FOREIGN KEY (grosstype_id) REFERENCES public.grosstype(grosstype_id);


--
-- Name: personnelsalary fk_psalary_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnelsalary
    ADD CONSTRAINT fk_psalary_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: salary fk_salary_personnel; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary
    ADD CONSTRAINT fk_salary_personnel FOREIGN KEY (personnel_id) REFERENCES public.personnel(personnel_id);


--
-- Name: salarydeductions fk_sdeduct_deduct; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salarydeductions
    ADD CONSTRAINT fk_sdeduct_deduct FOREIGN KEY (deduct_id) REFERENCES public.personnel_deductions(deduct_id);


--
-- Name: salarydeductions fk_sdeduct_salary; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salarydeductions
    ADD CONSTRAINT fk_sdeduct_salary FOREIGN KEY (salary_id) REFERENCES public.salary(salary_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict xZx7BU5eetZKd6vgNBNkywdvtTPS582emTdjEQjKeYWUzoQWdCrb3aPk0MrPuDt

