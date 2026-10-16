-- 可重複執行的少量示範資料。章節正文為原創示範文字，非原作內容。
insert into public.authors (name,bio) values
('金庸','武俠小說作家'),
('古龍','武俠小說作家'),
('梁羽生','武俠小說作家')
on conflict (name) do nothing;

insert into public.books (author_id,title,description,category,cover_style,is_published)
select a.id,v.title,v.description,v.category,v.cover_style,true
from (values
 ('金庸','射鵰英雄傳','以郭靖的成長為主線，交織江湖恩怨與家國情懷。','經典武俠','jade'),
 ('金庸','神鵰俠侶','楊過與小龍女的江湖經歷，交織情義與成長。','經典武俠','blue'),
 ('金庸','天龍八部','多位人物的命運交錯，呈現恩怨與身世之謎。','群像武俠','gold'),
 ('金庸','笑傲江湖','令狐沖身處門派紛爭，追尋自己的江湖之道。','經典武俠','red'),
 ('古龍','多情劍客無情劍','描繪友情、情感與江湖規則的矛盾。','奇情武俠','blue'),
 ('古龍','楚留香傳奇','楚留香憑藉機智追查撲朔迷離的江湖事件。','探案武俠','jade'),
 ('梁羽生','白髮魔女傳','描繪情感、門派與時代之間的衝突。','歷史武俠','gold'),
 ('梁羽生','七劍下天山','天山高手與江湖人物的俠義傳奇。','歷史武俠','red')
) as v(author_name,title,description,category,cover_style)
join public.authors a on a.name=v.author_name
where not exists (select 1 from public.books b where b.title=v.title and b.author_id=a.id);

insert into public.chapters (book_id,title,chapter_number,content,is_published)
select b.id,'第一章：江湖初見',1,
'暮色漸沉，遠山如黛。官道盡頭，一間老酒肆亮起昏黃燈火。屋外風聲漸急，簷下的銅鈴卻始終沒有響起。

店中只有三張桌子，其中兩張空著。靠窗的青衣客放下茶盞，目光落在門外那柄被雨水打濕的長劍上。他沒有問劍的主人是誰，只說了一句：今晚的風，不太尋常。

掌櫃聞言抬頭，手中的算盤停了一瞬。這座小鎮平日少有外客，近來卻接連來了幾名陌生人。有人尋人，有人尋物，也有人似乎只為等候一個從未露面的對手。',
true
from public.books b
where not exists (select 1 from public.chapters c where c.book_id=b.id and c.chapter_number=1);
