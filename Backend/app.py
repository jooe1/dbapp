import logging
from flask import Flask
from modules.routes import bp , get_ttr_for_table, get_zipfs_law_for_table, get_simpsons_index, get_latent_dirichlet_allocation,get_temporal_entropy,get_top_words_with_frequency, get_mann_whitney_for_years
from modules.database_handler import *
from modules.helpers import *
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
app.register_blueprint(bp)


def main():
    print("server up and running")
    app.run(debug=True, threaded=True)

    # table1 = "google_bigram_filtered"
    # table2 = "spiegel_bigram_filtered"
    # mann =get_mann_whitney_for_years(table1, table2)
    # print(mann)
    # generate_summary_for_table()



def generate_summary_for_table():
    # Create table in database that contains values from different measures 
    # create_new_table()
    table_name = "swr_sport_bigram_filtered"
    table_name_summary = "swr_sport_bigram_filtered_summary"
    conn, cur = connect_to_new_database()    

    add_ttr(table_name, table_name_summary,cur,conn)
    add_zipf(table_name, table_name_summary,cur,conn)
    add_simpson(table_name, table_name_summary,cur,conn)
    add_lda(table_name, cur,conn)
    add_entropy(table_name, table_name_summary,cur,conn)
    add_topwords(table_name,cur,conn)


    # result = get_lda_for_table(cur, table_name)
    # last_elements = [t[-1] for t in result]

    # print(result)
    # logging.basicConfig(filename="output.log", level=logging.INFO)
    # logging.info(last_elements)





def add_entropy(table_name, table_name_summary, cur, conn):
    entropy = get_temporal_entropy(table_name)
    string_entropy = [""]* len(entropy)
    i = 0
    for value in entropy:
        val_string = str(value)
        if not ('e' in val_string) and len(val_string) > 7:
            val_string = val_string[:7] 
        if 'e' in val_string and len(val_string) > 7:
            val_string = val_string[:3] + val_string[-4:]   
        string_entropy[i] = val_string
        i +=1
    qr = "INSERT INTO " + table_name_summary + " VALUES ( 'entropy' , " + ", ".join(string_entropy) + ")"
    cur.execute(qr)  
    conn.commit()

def add_topwords(table_name,  cur, conn):
    column_names = get_columns_from_table(cur, table_name)
    filtered_column_names, filtered_root_words = filter_words_starting_with_y(column_names)
    counter = 0
    top_words = get_top_words_with_frequency(table_name)
    for year in top_words:
        print(counter, end=', ')
        qr = "INSERT INTO top_values VALUES ( '" + table_name+ "' , '" + filtered_column_names[counter] + "', '" +"§§§".join(year) + "')"
        cur.execute(qr)  
        counter += 1   

    conn.commit()


def add_lda(table_name,  cur, conn):
    column_names = get_columns_from_table(cur, table_name)
    filtered_column_names, filtered_root_words = filter_words_starting_with_y(column_names)

    counter = 0
    lda = get_latent_dirichlet_allocation(table_name)
    for year in lda:
        topic_list = []
        for l in year:
            topic = l[1].split("+")
            for t in topic:
                topic_list.append(t.split("*")[1].replace('"', '').strip())
        print("year: " , filtered_column_names[counter] )
        # print(list(set(topic_list))) 
        qr = "INSERT INTO lda VALUES ( '" + table_name+ "' , '" + filtered_column_names[counter] + "', '" +"§§§".join(list(set(topic_list))) + "')"
        cur.execute(qr)  
        counter += 1   

    conn.commit()


def add_simpson(table_name, table_name_summary, cur, conn):
    column_names = get_columns_from_table(cur, table_name)

    simpsons = get_simpsons_index(table_name, column_names)
    string_simpsons = [""]* len(simpsons)
    i = 0
    for value in simpsons:
        val_string = str(value)
        if not ('e' in val_string) and len(val_string) > 7:
            val_string = val_string[:7] 
        if 'e' in val_string and len(val_string) > 7:
            val_string = val_string[:3] + val_string[-4:]   
 
        string_simpsons[i] = val_string
        i +=1
    qr = "INSERT INTO " + table_name_summary + " VALUES ( 'simpsons' , " + ", ".join(string_simpsons) + ")"
    cur.execute(qr)  
    conn.commit()

def add_zipf(table_name, table_name_summary, cur, conn):
    _, zipf = get_zipfs_law_for_table(table_name)
    string_zipf = [""]* len(zipf)
    i = 0
    for value in zipf:
        val_string = str(value)
        if not ('e' in val_string) and len(val_string) > 7:
            val_string = val_string[:7] 
        if 'e' in val_string and len(val_string) > 7:
            val_string = val_string[:3] + val_string[-4:]   
        string_zipf[i] = val_string
        i +=1
    qr = "INSERT INTO " + table_name_summary + " VALUES ( 'zipf' , " + ", ".join(string_zipf) + ")"
    cur.execute(qr)  
    conn.commit()


def add_ttr(table_name, table_name_summary, cur, conn):
    _, ttrs = get_ttr_for_table(table_name)
    string_ttr = [""]* len(ttrs)
    i = 0
    for value in ttrs:
        val_string = str(value)
        if not ('e' in val_string) and len(val_string) > 7:
            val_string = val_string[:7] 
        if 'e' in val_string and len(val_string) > 7:
            val_string = val_string[:3] + val_string[-4:]   
 
        string_ttr[i] = val_string
        i +=1
    qr = "INSERT INTO " + table_name_summary + " VALUES ( 'ttr' , " + ", ".join(string_ttr) + ")"
    cur.execute(qr)  
    conn.commit()



def create_new_table():
    conn, cur = connect_to_new_database()
    column_names = get_columns_from_table(cur, "swr_sport_bigram_filtered")
    filtered_column_names, filtered_root_words = filter_words_starting_with_y(column_names)
    qr = "CREATE TABLE swr_sport_bigram_filtered_summary ( measure VARCHAR(24), " + " VARCHAR(24), ".join(filtered_column_names) + " VARCHAR(24) );"
    # # print(qr)
    
    cur.execute(qr)  
    conn.commit()


def test(cur):
    table_names = get_table_names(cur)
    print("table names: " , table_names )

    column_names = get_columns_from_table(cur, "google_unigram")
    # print("column names: " , column_names)

    filtered_names = filter_words_starting_with_y(column_names)
    print(filtered_names)
    

if __name__ == "__main__":
    main()
