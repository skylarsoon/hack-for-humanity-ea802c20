INSERT INTO public.households(id,name,vereda,community,members,phase,status,lat,lng,note,cost_usd) VALUES
('HH_01','Familia Gómez','Vereda La Maizena','Campesino',5,2,'progress',4.3285,-75.6955,'Casa 1 — construcción sismo-resistente en bahareque',1850),
('HH_02','Familia Nengarabe','Resguardo Ibanacuara','Embera Chamí',7,1,'delivered',4.3462,-75.7205,NULL,640),
('HH_03','Familia Queragama','Resguardo Ibanacuara','Embera Chamí',6,1,'needs',4.3481,-75.7172,NULL,0),
('HH_04','Familia Tascón','Resguardo Ibanacuara','Embera Chamí',4,3,'delivered',4.3445,-75.7231,NULL,210),
('HH_05','Familia Osorio','Vereda La Maizena','Campesino',3,1,'needs',4.3301,-75.6921,NULL,0),
('HH_06','Familia Henao','Los Juanes','Campesino',5,2,'progress',4.3215,-75.7085,NULL,720),
('HH_07','Familia Arce','Los Juanes','Campesino',6,3,'needs',4.3192,-75.7041,NULL,95),
('HH_08','Familia Siagama','Resguardo Ibanacuara','Embera Chamí',8,1,'delivered',4.3499,-75.7248,NULL,1320);

INSERT INTO public.expenses(id,date,vendor,method,description,cop,usd,phase,receipt,source,created_by) VALUES
('00000000-0000-4000-8000-000000000001','2026-08-14','Ferretería Pijao','Factura','48 tejas de zinc calibre 33 + clavos',1240*3230,1240,1,'FV-00841','seed',NULL),
('00000000-0000-4000-8000-000000000002','2026-08-16','SolarAndes Armenia','Nequi','Panel solar comunitario Ibanacuara + 20 lámparas',2100*3230,2100,1,'NQ-3381920','seed',NULL),
('00000000-0000-4000-8000-000000000003','2026-08-22','Aserrío La Maizena','Efectivo + Acta','Guadua y madera para bahareque — Casa 1',1650*3230,1650,2,'ACTA-012','seed',NULL),
('00000000-0000-4000-8000-000000000004','2026-08-25','Droguería Pijao','Factura','30 kits de agua e higiene',780*3230,780,1,'FV-2290','seed',NULL),
('00000000-0000-4000-8000-000000000005','2026-09-02','Agrovivero Quindío','Nequi','Semillas de huerta + herramientas + materiales arte',430*3230,430,3,'NQ-3412207','seed',NULL);

INSERT INTO public.expense_items(expense_id,item,qty,category,usd) VALUES
('00000000-0000-4000-8000-000000000001','Tejas de Zinc',48,'roof',1240),
('00000000-0000-4000-8000-000000000002','Panel solar comunitario + lámparas',21,'energy',2100),
('00000000-0000-4000-8000-000000000003','Guadua y madera para bahareque',1,'rebuild',1650),
('00000000-0000-4000-8000-000000000004','Kit Agua/Higiene',30,'water',780),
('00000000-0000-4000-8000-000000000005','Semillas de huerta + herramientas',1,'heal',430);

INSERT INTO public.expense_households(expense_id,household_id) VALUES
('00000000-0000-4000-8000-000000000001','HH_02'),('00000000-0000-4000-8000-000000000001','HH_08'),('00000000-0000-4000-8000-000000000001','HH_06'),
('00000000-0000-4000-8000-000000000002','HH_08'),('00000000-0000-4000-8000-000000000002','HH_02'),('00000000-0000-4000-8000-000000000002','HH_04'),
('00000000-0000-4000-8000-000000000003','HH_01'),
('00000000-0000-4000-8000-000000000004','HH_02'),('00000000-0000-4000-8000-000000000004','HH_07'),('00000000-0000-4000-8000-000000000004','HH_08'),
('00000000-0000-4000-8000-000000000005','HH_04');

INSERT INTO public.household_needs(household_id,item,qty,unit_usd,category,status) VALUES
('HH_01','Madera Bahareque',1,180,'rebuild','open'),
('HH_03','Tejas de Zinc',1,26,'roof','open'),
('HH_03','Kit Agua/Higiene',1,26,'water','open'),
('HH_05','Tejas de Zinc',1,26,'roof','open'),
('HH_05','Lámpara Solar',1,35,'energy','open'),
('HH_06','Madera Bahareque',1,180,'rebuild','open'),
('HH_07','Semillas Huerta',1,15,'heal','open'),
('HH_01','Tejas de Zinc',1,26,'roof','delivered'),
('HH_01','Lámpara Solar',1,35,'energy','delivered'),
('HH_02','Tejas de Zinc',1,26,'roof','delivered'),
('HH_02','Kit Agua/Higiene',1,26,'water','delivered'),
('HH_02','Lámpara Solar',1,35,'energy','delivered'),
('HH_04','Semillas Huerta',1,15,'heal','delivered'),
('HH_04','Lámpara Solar',1,35,'energy','delivered'),
('HH_06','Tejas de Zinc',1,26,'roof','delivered'),
('HH_07','Kit Agua/Higiene',1,26,'water','delivered'),
('HH_08','Tejas de Zinc',1,26,'roof','delivered'),
('HH_08','Kit Agua/Higiene',1,26,'water','delivered'),
('HH_08','Panel solar comunitario',1,120,'energy','delivered');